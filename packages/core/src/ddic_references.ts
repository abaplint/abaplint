import {IObject} from "./objects/_iobject";
import {IDDICReferences, IObjectAndToken} from "./_iddic_references";

export class DDICReferences implements IDDICReferences {
  private readonly nameTypeIndex: { [name: string]: { [type: string]: IObjectAndToken[] } } = {};

  public setUsing(obj: IObject, using: IObjectAndToken[]): void {
    this.clear(obj);
    for (const u of using) {
      this.addUsing(obj, u);
    }
  }

  public addUsing(obj: IObject, using: IObjectAndToken | undefined) {
    if (using === undefined) {
      return;
    }

    const newName = obj.getName().toUpperCase();
    const newType = obj.getType();

    if (this.nameTypeIndex[newName] === undefined) {
      this.nameTypeIndex[newName] = {};
    }
    if (this.nameTypeIndex[newName][newType] === undefined) {
      this.nameTypeIndex[newName][newType] = [];
    }
    this.nameTypeIndex[newName][newType].push(using);
  }

  public clear(obj: IObject) {
    const newName = obj.getName().toUpperCase();
    const newType = obj.getType();
    if (this.nameTypeIndex[newName]?.[newType]) {
      this.nameTypeIndex[newName][newType] = [];
    }
  }

  public listUsing(obj: IObject): readonly IObjectAndToken[] {
    const newName = obj.getName().toUpperCase();
    const newType = obj.getType();

    const found = this.nameTypeIndex[newName]?.[newType];
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

    for (const name in this.nameTypeIndex) {
      for (const type in this.nameTypeIndex[name]) {
        for (const f of this.nameTypeIndex[name][type]) {
          if (f.object && f.object.getType() === searchType && f.object.getName() === searchName) {
            ret.push({type, name, token: f.token, filename: f.filename});
          }
        }
      }
    }

    return ret;
  }

}