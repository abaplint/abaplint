import {IObject} from "./objects/_iobject";

export interface IDDICReferences {
  setUsing(obj: IObject, using: IObject[]): void;

  listUsing(obj: IObject): IObject[];

  listWhereUsed(obj: IObject): {type: string, name: string}[];
}