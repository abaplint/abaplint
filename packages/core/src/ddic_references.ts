import {IObject} from "./objects/_iobject";
import {IDDICReferences, IObjectAndToken} from "./_iddic_references";

export class DDICReferences implements IDDICReferences {
  private readonly nameTypeIndex: { [name: string]: { [type: string]: IObjectAndToken[] } } = {};
  private readonly filenameIndex: { [filename: string]: { [line: number]: IObjectAndToken[] } } = {};

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

    // add to name and type index
    const newName = obj.getName().toUpperCase();
    const newType = obj.getType();
    if (this.nameTypeIndex[newName] === undefined) {
      this.nameTypeIndex[newName] = {};
    }
    if (this.nameTypeIndex[newName][newType] === undefined) {
      this.nameTypeIndex[newName][newType] = [];
    }
    this.nameTypeIndex[newName][newType].push(using);

    // add to filename index
    if (using.filename && using.token) {
      if (this.filenameIndex[using.filename] === undefined) {
        this.filenameIndex[using.filename] = {};
      }
      if (this.filenameIndex[using.filename][using.token.getRow()] === undefined) {
        this.filenameIndex[using.filename][using.token.getRow()] = [];
      }
      this.filenameIndex[using.filename][using.token.getRow()].push(using);
    }
  }

  public clear(obj: IObject) {
    // remove from filenameIndex first
    for (const u of this.listUsing(obj)) {
      if (u.filename && u.token) {
        const found = this.filenameIndex[u.filename]?.[u.token.getRow()];
        if (found) {
          found.pop(); // TODODOD, this assumes there is max one reference on each line
        }
      }
    }

    const newName = obj.getName().toUpperCase();
    const newType = obj.getType();
    if (this.nameTypeIndex[newName]?.[newType]) {
      this.nameTypeIndex[newName][newType] = [];
    }
  }

  public listByFilename(filename: string, line: number): IObjectAndToken[] {
    return this.filenameIndex[filename]?.[line] || [];
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