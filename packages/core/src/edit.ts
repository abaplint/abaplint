import {Token} from "./abap/1_lexer/tokens/_token";
import {IFile} from "./files/_ifile";
import {Position} from "./position";

interface IRange {
  start: Position;
  end: Position;
}

interface ITextEdit {
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
}