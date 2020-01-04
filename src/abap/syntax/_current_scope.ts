import {ClassDefinition, InterfaceDefinition, FormDefinition} from "../types";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Registry} from "../../registry";
import {BuiltIn} from "./_builtin";
import * as Objects from "../../objects";
import {DDIC} from "../../ddic";
import {Position} from "../../position";
import {SpaghettiScope, SpaghettiScopeNode, IScopeIdentifier} from "./_spaghetti_scope";
import {Token} from "../tokens/_token";
import {Identifier} from "../types/_identifier";

export enum ScopeType {
  BuiltIn = "_builtin",
  Global = "_global",
  Program = "_program",
  Form = "form",
  Function = "function",
  Method = "method",
  ClassDefinition = "class_definition",
  ClassImplementation = "class_implementation",
}

export class CurrentScope {
  private readonly reg: Registry;
  private current: SpaghettiScopeNode | undefined;

  public static buildDefault(reg: Registry): CurrentScope {
    const s = new CurrentScope(reg);

    s.push(ScopeType.BuiltIn, ScopeType.BuiltIn, new Position(1, 1), BuiltIn.filename);
    this.addBuiltIn(s, reg);

    s.push(ScopeType.Global, ScopeType.Global, new Position(1, 1), ScopeType.Global);

    return s;
  }

  private static addBuiltIn(s: CurrentScope, reg: Registry) {
    const builtin = BuiltIn.get(reg.getConfig().getSyntaxSetttings().globalConstants);
    s.addList(builtin);
    for (const t of BuiltIn.getTypes()) {
      s.addType(t);
    }
  }

  private constructor(reg: Registry) {
    this.current = undefined;
    this.reg = reg;
  }

///////////////////////////

  public addType(type: TypedIdentifier | undefined) {
    if (type === undefined) {
      return;
    }
    this.current?.getData().types.push(type);
  }

  public addClassDefinition(c: ClassDefinition) {
    this.current?.getData().cdefs.push(c);
  }

  public addFormDefinitions(f: FormDefinition[]) {
    if (this.current === undefined) {
      return;
    }
    this.current.getData().forms = this.current.getData().forms.concat(f);
  }

  public addInterfaceDefinition(i: InterfaceDefinition) {
    this.current?.getData().idefs.push(i);
  }

  public addNamedIdentifier(name: string, identifier: TypedIdentifier) {
    this.current?.getData().vars.push({name, identifier});
  }

  public addIdentifier(identifier: TypedIdentifier | undefined) {
    if (identifier === undefined) {
      return;
    }
    this.current?.getData().vars.push({name: identifier.getName(), identifier});
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

///////////////////////////

  public addRead(token: Token, resolved: TypedIdentifier, filename: string) {
    const position = new Identifier(token, filename);
    this.current?.getData().reads.push({position, resolved});
  }

  public addWrite(token: Token, resolved: TypedIdentifier, filename: string) {
    const position = new Identifier(token, filename);
    this.current?.getData().writes.push({position, resolved});
  }

///////////////////////////

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

///////////////////////////

  public findClassDefinition(name: string): ClassDefinition | undefined {
    return this.current?.findClassDefinition(name);
  }

  public findFormDefinition(name: string): FormDefinition | undefined {
    return this.current?.findFormDefinition(name);
  }

  public findInterfaceDefinition(name: string): InterfaceDefinition | undefined {
    return this.current?.findInterfaceDefinition(name);
  }

  public findType(name: string): TypedIdentifier | undefined {
    return this.current?.findType(name);
  }

  public findVariable(name: string): TypedIdentifier | undefined {
    return this.current?.findVariable(name);
  }

///////////////////////////

  public getDDIC(): DDIC {
    return new DDIC(this.reg);
  }

  public getName(): string { // todo, investigate if this method can be removed
    if (this.current === undefined) {
      throw new Error("error, getName");
    }
    return this.current.getIdentifier().sname;
  }

  public push(stype: ScopeType, sname: string, start: Position, filename: string): void {
    const identifier: IScopeIdentifier = {stype, sname, start, filename};

    if (this.current === undefined) {
      this.current = new SpaghettiScopeNode(identifier, undefined);
    } else {
      const parent = this.current;
      this.current = new SpaghettiScopeNode(identifier, parent);
      parent.addChild(this.current);
    }
  }

  public pop(): SpaghettiScope {
    if (this.current === undefined) {
      throw new Error("something wrong, top scope popped");
    }

    const current = this.current;
    this.current = this.current.getParent();
    return new SpaghettiScope(current);
  }
}
