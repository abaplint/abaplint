import {IObject} from "./objects/_iobject";
import {IDDICReferences} from "./_iddic_references";

export class DDICReferences implements IDDICReferences {

  public addUsing(obj: IObject, using: IObject): void {
    throw new Error("Method not implemented.");
  }

  public clearUsing(obj: IObject): void {
    throw new Error("Method not implemented.");
  }

  public listUsing(obj: IObject): IObject[] {
    throw new Error("Method not implemented.");
  }

  public listUsedBy(obj: IObject): IObject[] {
    throw new Error("Method not implemented.");
  }

}