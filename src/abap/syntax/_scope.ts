import {Identifier} from "../types/_identifier";
import {ClassDefinition, InterfaceDefinition} from "../types";

interface IVar {
  name: string;
  identifier?: Identifier;
}

export class Scope {

  private readonly scopes: {
    name: string,
    vars: IVar[],
    cdef: ClassDefinition[],
    idef: InterfaceDefinition[],
  }[];

  constructor(builtin: Identifier[]) {
    this.scopes = [];
    this.pushScope("_builtin");
    this.addList(builtin);
    this.pushScope("_global");
  }

  public get() {
    return this.scopes;
  }

  public addClassDefinition(c: ClassDefinition) {
    this.scopes[this.scopes.length - 1].cdef.push(c);
  }

  public findClassDefinition(name: string): ClassDefinition | undefined {
    // todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const cdef of scope.cdef) {
        if (cdef.getName().toUpperCase() === name.toUpperCase()) {
          return cdef;
        }
      }
    }
    return undefined;
  }

  public addInterfaceDefinition(i: InterfaceDefinition) {
    this.scopes[this.scopes.length - 1].idef.push(i);
  }

  public findInterfaceDefinition(name: string): InterfaceDefinition | undefined {
    // todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const idef of scope.idef) {
        if (idef.getName().toUpperCase() === name.toUpperCase()) {
          return idef;
        }
      }
    }
    return undefined;
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

  public pushScope(name: string): Scope {
    this.scopes.push({
      name: name,
      vars: [],
      cdef: [],
      idef: [],
    });
    return this;
  }

  public popScope() {
    this.scopes.pop();
    if (this.scopes.length === 0) {
      throw new Error("something wrong, top scope popped");
    }
  }
}
