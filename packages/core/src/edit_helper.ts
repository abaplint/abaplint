import {Token} from "./abap/1_lexer/tokens/_token";
import {IFile} from "./files/_ifile";
import {Position} from "./position";
import {IRegistry} from "./_iregistry";
import {MemoryFile} from "./files/memory_file";
import {StatementNode} from "./abap/nodes/statement_node";
import {ABAPFile} from "./abap/abap_file";

export interface IRange {
  start: Position;
  end: Position;
}

export interface ITextEdit {
  range: IRange;
  newText: string;
}

export interface IEdit {
  [filename: string]: ITextEdit[];
}

export class EditHelper {

  public static merge(fix1: IEdit, fix2: IEdit): IEdit {
    const ret: IEdit = {};

    for (const k of Object.keys(fix1)) {
      if (ret[k] === undefined) {
        ret[k] = [];
      }
      ret[k] = ret[k].concat(fix1[k]);
    }

    for (const k of Object.keys(fix2)) {
      if (ret[k] === undefined) {
        ret[k] = [];
      }
      ret[k] = ret[k].concat(fix2[k]);
    }

    return ret;
  }

  public static deleteStatement(file: ABAPFile, statement: StatementNode): IEdit {
    // todo, take care care of chaining
    return EditHelper.deleteRange(file, statement.getFirstToken().getStart(), statement.getLastToken().getEnd());
  }

  public static deleteToken(file: IFile, token: Token): IEdit {
    const filename = file.getFilename();
    const range: IRange = {start: token.getStart(), end: token.getEnd()};
    return {[filename]: [{range, newText: ""}]};
  }

  public static deleteRange(file: IFile, start: Position, end: Position): IEdit {
    const filename = file.getFilename();
    const range: IRange = {start, end};
    return {[filename]: [{range, newText: ""}]};
  }

  public static insertAt(file: IFile, pos: Position, text: string): IEdit {
    const filename = file.getFilename();
    const range: IRange = {start: pos, end: pos};
    return {[filename]: [{range, newText: text}]};
  }

  public static replaceRange(file: IFile, start: Position, end: Position, text: string): IEdit {
    const filename = file.getFilename();
    const range: IRange = {start, end};
    return {[filename]: [{range, newText: text}]};
  }
}

export function applyEditSingle(reg: IRegistry, edit: IEdit) {
  for (const filename in edit) {
    let rows = reg.getFileByName(filename)?.getRawRows();
    if (rows === undefined) {
      throw new Error("applyEdit, file not found");
    }

    for (const e of edit[filename]) {
      if (e.range.start.getRow() === e.range.end.getRow()) {
        const line = rows[e.range.start.getRow() - 1];
        rows[e.range.start.getRow() - 1] =
          line.substr(0, e.range.start.getCol() - 1) +
          e.newText +
          line.substr(e.range.end.getCol() - 1);
      } else {
        const first = rows[e.range.start.getRow() - 1];
        let res = first.substr(0, e.range.start.getCol() - 1) + e.newText;
        const last = rows[e.range.end.getRow() - 1];
        res = res + last.substr(e.range.end.getCol() - 1);
        // delete middle lines
        rows.splice(e.range.start.getRow(), e.range.end.getRow() - e.range.start.getRow());
        // clean up
        rows[e.range.start.getRow() - 1] = res;
        rows = rows.join("\n").split("\n"); // if the edit contained newlines and multiple edits
      }
    }
    const result = new MemoryFile(filename, rows.join("\n"));

    reg.updateFile(result);
  }
}

/** returns list of filenames which were changed */
export function applyEditList(reg: IRegistry, edits: IEdit[]): string[] {
  const ret: string[] = [];
  let length = 0;

  const merged: IEdit = {};
  for (const e of edits) {
    for (const f in e) {
      if (merged[f] === undefined) {
        merged[f] = [];
        length = length + 1;
      }
      merged[f] = merged[f].concat(e[f]);
    }
  }

  for (const f in merged) {
    const singleFile: IEdit = {};
    // sort, start with the last position first
    singleFile[f] = merged[f].sort((a, b) => {
      let val = b.range.start.getRow() - a.range.start.getRow();
      if (val === 0) {
        val = b.range.start.getCol() - a.range.start.getCol();
      }
      return val;
    });

    applyEditSingle(reg, singleFile);

    ret.push(f);
  }

  return ret;
}