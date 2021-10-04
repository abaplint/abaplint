import {IObject} from "./objects/_iobject";
import {IDDICReferences, IObjectAndToken} from "./_iddic_references";

export class DDICReferences implements IDDICReferences {
  private readonly index: { [name: string]: { [type: string]: IObjectAndToken[] } } = {};

  public setUsing(obj: IObject, using: IObjectAndToken[]): void {
    const newName = obj.getName().toUpperCase();
    const newType = obj.getType();

    if (this.index[newName] === undefined) {
      this.index[newName] = {};
    }
    this.index[newName][newType] = using;
  }

  public addUsing(obj: IObject, using: IObjectAndToken | undefined) {
    if (using === undefined) {
      return;
    }

    const newName = obj.getName().toUpperCase();
    const newType = obj.getType();

    if (this.index[newName] === undefined) {
      this.index[newName] = {};
    }
    if (this.index[newName][newType] === undefined) {
      this.index[newName][newType] = [];
    }
    this.index[newName][newType].push(using);
  }

  public clear(obj: IObject) {
    this.setUsing(obj, []);
  }

  public listUsing(obj: IObject): readonly IObjectAndToken[] {
    const newName = obj.getName().toUpperCase();
    const newType = obj.getType();

    const found = this.index[newName]?.[newType];
    if (found !== undefined) {
      return found;
    } else {
      return [];
    }
  }

  public listWhereUsed(obj: IObject) {
    // todo, add reverse index, this is slow

    const ret = [];
    const searchName = obj.getName().toUpperCase();
    const searchType = obj.getType();

    for (const name in this.index) {
      for (const type in this.index[name]) {
        for (const f of this.index[name][type]) {
          if (f.object && f.object.getType() === searchType && f.object.getName() === searchName) {
            ret.push({type, name, token: f.token, filename: f.filename});
          }
        }
      }
    }

    return ret;
  }

}