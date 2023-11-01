import {IObject} from "./objects/_iobject";
import {AbstractToken} from "./abap/1_lexer/tokens/abstract_token";

export interface IMSAGReferences {
  clear(obj: IObject): void;

  addUsing(filename: string, token: AbstractToken, messageClass: string, number: string): void;

  listByFilename(filename: string): {token: AbstractToken, messageClass: string, number: string}[];
  listByMessage(messageClass: string, number: string): {filename: string, token: AbstractToken}[];
}