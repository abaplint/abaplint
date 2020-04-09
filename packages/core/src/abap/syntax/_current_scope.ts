import {ClassDefinition, InterfaceDefinition, FormDefinition} from "../types";
import {TypedIdentifier} from "../types/_typed_identifier";
import {BuiltIn} from "./_builtin";
import {DDIC} from "../../ddic";
import {Position} from "../../position";
import {SpaghettiScope, SpaghettiScopeNode, IScopeIdentifier} from "./spaghetti_scope";
import {Token} from "../1_lexer/tokens/_token";
import {Identifier} from "../types/_identifier";
import {ScopeType} from "./_scope_type";
import {IRegistry} from "../../_iregistry";
import {IClassDefinition} from "../types/_class_definition";

export class CurrentScope {
  protected readonly reg: IRegistry | undefined;
  protected current: SpaghettiScopeNode | undefined;

  public static buildDefault(reg: IRegistry): CurrentScope {
    const s = new CurrentScope(reg);

    s.push(ScopeType.BuiltIn, ScopeType.BuiltIn, new Position(1, 1), BuiltIn.filename);
    this.addBuiltIn(s, reg.getConfig().getSyntaxSetttings().globalConstants!);

    s.push(ScopeType.Global, ScopeType.Global, new Position(1, 1), ScopeType.Global);

    return s;
  }

  // dont call push() and pop() on dummy scopes
  public static buildDummy(sup: CurrentScope): CurrentScope {
    const s = new CurrentScope(sup.reg);

    const identifier: IScopeIdentifier = {
      stype: ScopeType.Dummy,
      sname: ScopeType.Dummy,
      start: new Position(1, 1),
      filename: "dummy"};

    s.current = new SpaghettiScopeNode(identifier, sup.current);

    return s;
  }

  public static buildEmpty(): CurrentScope {
    const s = new CurrentScope();

    const identifier: IScopeIdentifier = {
      stype: ScopeType.Dummy,
      sname: ScopeType.Dummy,
      start: new Position(1, 1),
      filename: "dummy"};

    s.current = new SpaghettiScopeNode(identifier, undefined);

    s.push(ScopeType.BuiltIn, ScopeType.BuiltIn, new Position(1, 1), BuiltIn.filename);
    this.addBuiltIn(s, []);

    return s;
  }

  private static addBuiltIn(s: CurrentScope, extras: string[]) {
    const builtin = BuiltIn.get(extras);
    s.addList(builtin);
    for (const t of BuiltIn.getTypes()) {
      s.addType(t);
    }
  }

  private constructor(reg?: IRegistry) {
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

  public addListPrefix(identifiers: readonly TypedIdentifier[], prefix: string) {
    for (const id of identifiers) {
      this.addNamedIdentifier(prefix + id.getName(), id);
    }
  }

  public addList(identifiers: readonly TypedIdentifier[]) {
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

  public findObjectReference(name: string): boolean {
    const clocal = this.findClassDefinition(name);
    if (clocal) {
      return true;
    }
    const ilocal = this.findInterfaceDefinition(name);
    if (ilocal) {
      return true;
    }
    const cglobal = this.reg?.getObject("CLAS", name);
    if (cglobal) {
      return true;
    }
    const iglobal = this.reg?.getObject("INTF", name);
    if (iglobal) {
      return true;
    }

    return false;
  }

///////////////////////////

  public findClassDefinition(name: string): IClassDefinition | undefined {
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

  public getDDIC(): DDIC | undefined {
    if (this.reg === undefined) {
      return undefined;
    }
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
