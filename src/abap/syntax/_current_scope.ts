import {ClassDefinition, InterfaceDefinition, FormDefinition} from "../types";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Registry} from "../../registry";
import {Globals} from "./_globals";
import * as Objects from "../../objects";
import {DDIC} from "../../ddic";

export enum ScopeType {
  BuiltIn = "_builtin",
  Global = "_global",
  Form = "form",
  Function = "function",
  Method = "method",
  ClassDefinition = "class_definition",
  ClassImplementation = "class_implementation",
}

interface IScopeInfo {
  stype: ScopeType;
  sname: string;

  vars: {name: string; identifier: TypedIdentifier}[];
  cdefs: ClassDefinition[];
  idefs: InterfaceDefinition[];
  forms: FormDefinition[];
  types: TypedIdentifier[];
}

export class CurrentScope {
  private readonly scopes: IScopeInfo[];
  private readonly reg: Registry;

  public static buildDefault(reg: Registry): CurrentScope {
    const s = new CurrentScope(reg);

    s.push(ScopeType.BuiltIn, ScopeType.BuiltIn);
    this.addBuiltIn(s, reg);

    s.push(ScopeType.Global, ScopeType.Global);

    return s;
  }

  private static addBuiltIn(s: CurrentScope, reg: Registry) {
    const builtin = Globals.get(reg.getConfig().getSyntaxSetttings().globalConstants);
    s.addList(builtin);
    for (const t of Globals.getTypes()) {
      s.addType(t);
    }
  }

  private constructor(reg: Registry) {
    this.scopes = [];
    this.reg = reg;
  }

  public get() {
    return this.scopes;
  }

  public getDDIC(): DDIC {
    return new DDIC(this.reg);
  }

  public addType(type: TypedIdentifier | undefined) {
    if (type === undefined) {
      return;
    }
    this.scopes[this.scopes.length - 1].types.push(type);
  }

  public addClassDefinition(c: ClassDefinition) {
    this.scopes[this.scopes.length - 1].cdefs.push(c);
  }

  public addFormDefinitions(f: FormDefinition[]) {
    this.scopes[this.scopes.length - 1].forms = this.scopes[this.scopes.length - 1].forms.concat(f);
  }

  public findClassDefinition(name: string): ClassDefinition | undefined {
    // todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const cdef of scope.cdefs) {
        if (cdef.getName().toUpperCase() === name.toUpperCase()) {
          return cdef;
        }
      }
    }

    return undefined;
  }

  public findObjectReference(name: string): ClassDefinition | InterfaceDefinition | undefined {
    const clocal = this.findClassDefinition(name);
    if (clocal) {
      return clocal;
    }
    const ilocal = this.findInterfaceDefinition(name);
    if (ilocal) {
      return ilocal;
    }
    const cglobal = this.reg.getObject("CLAS", name) as Objects.Class | undefined;
    if (cglobal) {
      return cglobal.getClassDefinition();
    }
    const iglobal = this.reg.getObject("INTF", name) as Objects.Interface | undefined;
    if (iglobal) {
      return iglobal.getDefinition();
    }
    return undefined;
  }

  public findFormDefinition(name: string): FormDefinition | undefined {
    // todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const form of scope.forms) {
        if (form.getName().toUpperCase() === name.toUpperCase()) {
          return form;
        }
      }
    }
    return undefined;
  }

  public addInterfaceDefinition(i: InterfaceDefinition) {
    this.scopes[this.scopes.length - 1].idefs.push(i);
  }

  public findInterfaceDefinition(name: string): InterfaceDefinition | undefined {
    // todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const idef of scope.idefs) {
        if (idef.getName().toUpperCase() === name.toUpperCase()) {
          return idef;
        }
      }
    }
    return undefined;
  }

  public addIdentifier(identifier: TypedIdentifier | undefined) {
    if (identifier === undefined) {
      return;
    }
    this.scopes[this.scopes.length - 1].vars.push({name: identifier.getName(), identifier});
  }

  public addNamedIdentifier(name: string, identifier: TypedIdentifier) {
    this.scopes[this.scopes.length - 1].vars.push({name, identifier});
  }

  public addListPrefix(identifiers: TypedIdentifier[], prefix: string) {
    for (const id of identifiers) {
      this.addNamedIdentifier(prefix + id.getName(), id);
    }
  }

  public addList(identifiers: TypedIdentifier[]) {
    for (const id of identifiers) {
      this.addIdentifier(id);
    }
  }

  public resolveType(name: string): TypedIdentifier | undefined {
    // todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const local of scope.types) {
        if (local.getName().toUpperCase() === name.toUpperCase()) {
          return local;
        }
      }
    }
    return undefined;
  }

  public resolveVariable(name: string): TypedIdentifier | undefined {
    // todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const local of scope.vars) {
        if (local.name.toUpperCase() === name.toUpperCase()) {
          return local.identifier;
        }
      }
    }
    return undefined;
  }

  public getName(): string {
    return this.scopes[this.scopes.length - 1].sname;
  }

  public push(stype: ScopeType, sname: string): void {
    this.scopes.push({
      stype,
      sname,
      vars: [],
      cdefs: [],
      idefs: [],
      forms: [],
      types: [],
    });
  }

  public pop(): void {
    if (this.scopes.length === 1) {
      throw new Error("something wrong, top scope popped");
    }
    this.scopes.pop();
  }
}
