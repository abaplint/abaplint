import {TypedIdentifier} from "../types/_typed_identifier";

export class Variables {
  private scopes: {name: string; ids: TypedIdentifier[]; }[];

  constructor() {
    this.scopes = [];
    this.pushScope("_global", []);
  }

  public add(identifier: TypedIdentifier) {
    this.scopes[this.scopes.length - 1].ids.push(identifier);
  }

  public addList(identifiers: TypedIdentifier[]) {
    for (const id of identifiers) {
      this.add(id);
    }
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
    return this.scopes[this.scopes.length - 1].name;
  }

  public pushScope(name: string, ids: TypedIdentifier[]) {
    this.scopes.push({name: name, ids: ids});
  }

  public popScope() {
    this.scopes.pop();
    if (this.scopes.length === 0) {
      throw new Error("something wrong, global scope popped");
    }
  }
}
