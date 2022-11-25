import {IFile} from "../../files/_ifile";
import {Token} from "./tokens/_token";

export type IABAPLexerResult = {
  readonly file: IFile;
  readonly tokens: readonly Token[];
};