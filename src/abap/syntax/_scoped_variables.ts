import {Identifier} from "../types/_identifier";

interface IVar {
  name: string;
  identifier?: Identifier;
}

export class ScopedVariables {
  private scopes: {name: string; vars: IVar[]}[];

  constructor() {
    this.scopes = [];
    this.pushScope("_global");
  }

  public get() {
    return this.scopes;
  }

  public addIdentifier(identifier: Identifier) {
    this.scopes[this.scopes.length - 1].vars.push({name: identifier.getName(), identifier});
  }

  public addNamedIdentifier(name: string, identifier: Identifier) {
    this.scopes[this.scopes.length - 1].vars.push({name, identifier});
  }

  public addName(name: string) {
    this.scopes[this.scopes.length - 1].vars.push({name});
  }

  public addList(identifiers: Identifier[], prefix?: string | undefined) {
    for (const id of identifiers) {
      if (prefix) {
        this.addNamedIdentifier(prefix + id.getName(), id);
      } else {
        this.addIdentifier(id);
      }
    }
  }

  public getCurrentScope(): Identifier[] {
    const ret: Identifier[] = [];
    for (const v of this.scopes[this.scopes.length - 1].vars) {
      if (v.identifier) {
        ret.push(v.identifier);
      }
    }
    return ret;
  }

  public resolve(name: string): Identifier | string | undefined {
    // todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const local of scope.vars) {
        if (local.name.toUpperCase() === name.toUpperCase()) {
          return local.identifier ? local.identifier : local.name;
        }
      }
    }
    return undefined;
  }

  public getParentName(): string {
    return this.scopes[this.scopes.length - 2].name;
  }

  public pushScope(name: string): ScopedVariables {
    this.scopes.push({name: name, vars: []});
    return this;
  }

  public popScope() {
    this.scopes.pop();
    if (this.scopes.length === 0) {
      throw new Error("something wrong, global scope popped");
    }
  }
}
