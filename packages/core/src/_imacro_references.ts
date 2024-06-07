import {AbstractToken} from "./abap/1_lexer/tokens/abstract_token";

export interface IFilenameAndToken {
  filename: string;
  token: AbstractToken;
}

export interface IMacroReferences {
  addDefinition(ref: IFilenameAndToken): void;
  addReference(ref: IFilenameAndToken): void;
  listDefinitionsByFile(filename: string): IFilenameAndToken[];
  listUsagesbyMacro(filename: string, token: AbstractToken): IFilenameAndToken[];
  clear(filename: string): void;
}