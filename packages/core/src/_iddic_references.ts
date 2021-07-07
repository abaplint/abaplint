import {IObject} from "./objects/_iobject";

export interface IDDICReferences {
  addUsing(obj: IObject, using: IObject): void;
  clearUsing(obj: IObject): void;

  listUsing(obj: IObject): IObject[];

  listUsedBy(obj: IObject): IObject[];
}