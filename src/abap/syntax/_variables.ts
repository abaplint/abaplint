import {TypedIdentifier} from "../types/_typed_identifier";

export class Variables {
  private scopes: {name: string; ids: TypedIdentifier[]; }[];

  constructor() {
    this.scopes = [];
    this.pushScope("_global");
  }

  public add(identifier: TypedIdentifier) {
    this.scopes[this.scopes.length - 1].ids.push(identifier);
  }

  public addList(identifiers: TypedIdentifier[]) {
    for (const id of identifiers) {
      this.add(id);
    }
  }

  public getCurrentScope(): TypedIdentifier[] {
    return this.scopes[this.scopes.length - 1].ids;
  }

  public resolve(name: string): TypedIdentifier | undefined {
    // todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const local of scope.ids) {
        if (local.getName().toUpperCase() === name.toUpperCase()) {
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
    this.scopes.push({name: name, ids: []});
    return this;
  }

  public popScope() {
    this.scopes.pop();
    if (this.scopes.length === 0) {
      throw new Error("something wrong, global scope popped");
    }
  }
}
