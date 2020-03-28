import {IFile} from "../../files/_ifile";
import {Token} from "./tokens/_token";

export interface ILexerResult {
  readonly file: IFile;
  readonly tokens: readonly Token[];
}