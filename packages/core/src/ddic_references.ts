import {IObject} from "./objects/_iobject";
import {IDDICReferences} from "./_iddic_references";

export class DDICReferences implements IDDICReferences {
  private readonly index: { [name: string]: { [type: string]: IObject[] } } = {};

  public setUsing(obj: IObject, using: IObject[]): void {
    const newName = obj.getName().toUpperCase();
    const newType = obj.getType();

    if (this.index[newName] === undefined) {
      this.index[newName] = {};
    }
    this.index[newName][newType] = using;
  }

  public listUsing(obj: IObject): IObject[] {
    const newName = obj.getName().toUpperCase();
    const newType = obj.getType();

    const found = this.index[newName]?.[newType];
    if (found !== undefined) {
      return found;
    } else {
      return [];
    }
  }

  public listWhereUsed(obj: IObject): {type: string, name: string}[] {
    // todo, add reverse index, this is slow

    const ret: {type: string, name: string}[] = [];
    const searchName = obj.getName().toUpperCase();
    const searchType = obj.getType();

    for (const name in this.index) {
      for (const type in this.index[name]) {
        for (const f of this.index[name][type]) {
          if (f.getType() === searchType && f.getName() === searchName) {
            ret.push({type, name});
            break; // current outermost loop
          }
        }
      }
    }

    return ret;
  }

}