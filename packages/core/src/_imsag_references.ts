import {IObject} from "./objects/_iobject";
import {Token} from "./abap/1_lexer/tokens/_token";

export interface IMSAGReferences {
  clear(obj: IObject): void;

  addUsing(filename: string, token: Token, messageClass: string, number: number): void;

  listByFilename(filename: string): {token: Token, messageClass: string, number: number}[];
  listByMessage(messageClass: string, number: number): {filename: string, token: Token}[];
}