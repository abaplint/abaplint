import {Identifier} from "../types/_identifier";

export class Variables {
  private scopes: {name: string; ids: Identifier[]; other: string[] }[];

  constructor() {
    this.scopes = [];
    this.pushScope("_global");
  }

  public add(identifier: Identifier) {
    this.scopes[this.scopes.length - 1].ids.push(identifier);
  }

  public addOther(name: string) {
    this.scopes[this.scopes.length - 1].other.push(name);
  }

  public addList(identifiers: Identifier[], prefix?: string | undefined) {
    for (const id of identifiers) {
      if (prefix) {
        this.add(id.setName(prefix + id.getName()));
      } else {
        this.add(id);
      }
    }
  }

  public getCurrentScope(): Identifier[] {
    return this.scopes[this.scopes.length - 1].ids;
  }

  public resolve(name: string): Identifier | string | undefined {
    // todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const local of scope.ids) {
        if (local.getName().toUpperCase() === name.toUpperCase()) {
          return local;
        }
      }
      for (const local of scope.other) {
        if (local.toUpperCase() === name.toUpperCase()) {
          return local;
        }
      }
    }
    return undefined;
  }

  public getParentName(): string {
    return this.scopes[this.scopes.length - 2].name;
  }

  public pushScope(name: string): Variables {
    this.scopes.push({name: name, ids: [], other: []});
    return this;
  }

  public popScope() {
    this.scopes.pop();
    if (this.scopes.length === 0) {
      throw new Error("something wrong, global scope popped");
    }
  }
}
