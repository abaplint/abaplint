import {Token} from "./abap/1_lexer/tokens/_token";
import {IFile} from "./files/_ifile";
import {Position} from "./position";

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
}