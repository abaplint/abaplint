import {IObject} from "./objects/_iobject";

export interface IDDICReferences {
  setUsing(obj: IObject, using: readonly IObject[]): void;
  addUsing(obj: IObject, using: IObject | undefined): void;
  clear(obj: IObject): void;
  listUsing(obj: IObject): readonly IObject[];
  listWhereUsed(obj: IObject): {type: string, name: string}[];
}