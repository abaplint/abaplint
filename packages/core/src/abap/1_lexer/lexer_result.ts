import {IFile} from "../../files/_ifile";
import {AbstractToken} from "./tokens/abstract_token";

export type IABAPLexerResult = {
  readonly file: IFile;
  readonly tokens: readonly AbstractToken[];
};