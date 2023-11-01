import {IObject} from "./objects/_iobject";
import {AbstractToken} from "./abap/1_lexer/tokens/abstract_token";

export interface IObjectAndToken {
  object?: IObject;
  token?: AbstractToken;
  filename?: string;
}

export interface IDDICReferences {
  setUsing(obj: IObject, using: readonly IObjectAndToken[]): void;
  addUsing(obj: IObject, using: IObjectAndToken | undefined): void;
  clear(obj: IObject): void;
  listUsing(obj: IObject): readonly IObjectAndToken[];
  listByFilename(filename: string, line: number): readonly IObjectAndToken[];
  listWhereUsed(obj: IObject): {type: string, name: string, token?: AbstractToken;
    filename?: string;}[];
}