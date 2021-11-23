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

export class EditDraft {
  private start: Position | undefined = undefined;
  private end: Position | undefined = undefined;
  private readonly rows: string[];
  private readonly file: IFile;

  public constructor(file: IFile) {
    this.rows = file.getRawRows();
    this.file = file;
  }

  /** replace existing text, insert text wont work */
  public replace(pos: Position, value: string) {
    if (this.start === undefined || pos.isBefore(this.start)) {
      this.start = pos;
    }
    const end = new Position(pos.getRow(), pos.getCol() + value.length);
    if (this.end === undefined || end.isAfter(this.end)) {
      this.end = end;
    }

    const str = this.rows[pos.getRow() - 1];
    this.rows[pos.getRow() - 1] = str.substr(0, pos.getCol() - 1) + value + str.substr(pos.getCol() + value.length - 1);
  }

  public toEdit(): IEdit {
    if (this.start === undefined) {
      throw "EditDraft, start undefined";
    } else if (this.end === undefined) {
      throw "EditDraft, end undefined";
    }
    let value = "";
    for (let row = this.start.getRow(); row <= this.end.getRow(); row++) {
      if (row === this.start.getRow() && row === this.end.getRow()) {
        // first and last row
        value = this.rows[row - 1].substring(this.start.getCol() - 1, this.end.getCol() - 1);
      } else if (row === this.start.getRow()) {
        // first row
        value = this.rows[row - 1].substring(this.start.getCol() - 1);
      } else if (row === this.end.getRow()) {
        // last row
        value += "\n" + this.rows[row - 1].substring(0, this.end.getCol() - 1);
      } else {
        // middle row
        value += "\n" + this.rows[row - 1];
      }
    }
    return EditHelper.replaceRange(this.file, this.start, this.end, value);
  }
}

export class EditHelper {

  public static mergeList(fixes: IEdit[]): IEdit {
    const results: IEdit = {};
    for (const f of fixes) {
      for (const filename in f) {
        if (results[filename] === undefined) {
          results[filename] = [];
        }
        results[filename] = results[filename].concat(f[filename]);
      }
    }
    return results;
  }

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

  public static findStatement(token: Token, file: ABAPFile | undefined): StatementNode | undefined {
    if (file === undefined) {
      return undefined;
    }
    for (const s of file.getStatements()) {
      if (s.includesToken(token)) {
        return s;
      }
    }
    return undefined;
  }

  public static deleteStatement(file: ABAPFile, statement: StatementNode): IEdit {
    const scolon = statement.getColon();
    if (scolon === undefined) {
      return EditHelper.deleteRange(file, statement.getFirstToken().getStart(), statement.getLastToken().getEnd());
    }

    let setPrevious = true;
    let setNext = true;
    /** previous statement in the chain */
    let previousStatement: StatementNode | undefined = undefined;
    /** next statement in the chain */
    let nextStatement: StatementNode | undefined = undefined;
    for (const s of file.getStatements()) {
      const colon = s.getColon();
      if (colon === undefined) {
        continue;
      } else if (s === statement) {
        setPrevious = false;
        setNext = true;
        continue;
      } else if (setPrevious === true) {
        if (scolon.getStart().equals(colon.getStart())) {
          previousStatement = s;
        }
      } else if (setNext === true) {
        if (scolon.getStart().equals(colon.getStart())) {
          nextStatement = s;
        }
        break;
      }
    }
    if (previousStatement === undefined && nextStatement === undefined) {
      // the statement to be deleted is the only one in the chain
      return EditHelper.deleteRange(file, statement.getFirstToken().getStart(), statement.getLastToken().getEnd());
    }

    // the start of deletion should happen for tokens after the colon
    let startDelete = statement.getFirstToken().getStart();
    for (const t of statement.getTokens()) {
      if (t.getStart().isAfter(scolon.getEnd())) {
        startDelete = t.getStart();
        break;
      }
    }

    const colon = statement.getColon();
    if (statement.getLastToken().getStr() === "." && previousStatement) {
// last statement in chain
      const edit1 = EditHelper.replaceToken(file, previousStatement.getLastToken(), ".");
      const edit2 = EditHelper.deleteRange(file, previousStatement.getLastToken().getEnd(), statement.getLastToken().getEnd());
      return EditHelper.merge(edit1, edit2);
    } else if (previousStatement === undefined && colon && nextStatement) {
// first statement in chain
      return EditHelper.deleteRange(file, this.firstAfterColon(statement), this.firstAfterColon(nextStatement));
    } else {
// middle statement
      return EditHelper.deleteRange(file, startDelete, this.firstAfterColon(nextStatement!));
    }
  }

  public static firstAfterColon(statement: StatementNode): Position {
    const colon = statement.getColon()!.getStart();
    for (const t of statement.getTokens()) {
      if (t.getStart().isAfter(colon)) {
        return t.getStart();
      }
    }
    throw new Error("firstAfterColon, emtpy statement?");
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

  public static replaceToken(file: IFile, token: Token, text: string): IEdit {
    return this.replaceRange(file, token.getStart(), token.getEnd(), text);
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