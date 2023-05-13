import {IObject} from "./objects/_iobject";
import {Token} from "./abap/1_lexer/tokens/_token";

export interface IMSAGReferences {
  clear(obj: IObject): void;

  addUsing(filename: string, token: Token, messageClass: string, number: string): void;

  listByFilename(filename: string): {token: Token, messageClass: string, number: string}[];
  listByMessage(messageClass: string, number: string): {filename: string, token: Token}[];
}