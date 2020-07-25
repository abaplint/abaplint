import {TypedIdentifier} from "../types/_typed_identifier";
import {BuiltIn} from "./_builtin";
import {DDIC} from "../../ddic";
import {Position} from "../../position";
import {SpaghettiScope, SpaghettiScopeNode} from "./spaghetti_scope";
import {Token} from "../1_lexer/tokens/_token";
import {Identifier} from "../4_file_information/_identifier";
import {ScopeType} from "./_scope_type";
import {IRegistry} from "../../_iregistry";
import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {IFormDefinition} from "../types/_form_definition";
import {Class} from "../../objects/class";
import {Interface} from "../../objects/interface";
import {IScopeIdentifier, DeferredType} from "./_spaghetti_scope";
import {ReferenceType, IReferenceExtras} from "./_reference";

export class CurrentScope {
  protected readonly reg: IRegistry;
  protected current: SpaghettiScopeNode | undefined;

  public static buildDefault(reg: IRegistry): CurrentScope {
    const s = new CurrentScope(reg);

    s.push(ScopeType.BuiltIn, ScopeType.BuiltIn, new Position(1, 1), BuiltIn.filename);
    this.addBuiltIn(s, reg.getConfig().getSyntaxSetttings().globalConstants!);

    s.push(ScopeType.Global, ScopeType.Global, new Position(1, 1), ScopeType.Global);

    return s;
  }

  // dont call push() and pop() on dummy scopes
  /*
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
  */

  private static addBuiltIn(s: CurrentScope, extras: string[]) {
    const b = new BuiltIn();
    const builtin = b.get(extras);
    s.addList(builtin);
    for (const t of b.getTypes()) {
      s.addType(t);
    }
  }

  private constructor(reg: IRegistry) {
    this.current = undefined;
    this.reg = reg;
  }

///////////////////////////

  public addType(type: TypedIdentifier | undefined) {
    if (type === undefined) {
      return;
    }
    this.current?.getData().types.push({name: type.getName(), identifier: type});
  }

  public addTypeNamed(name: string, type: TypedIdentifier | undefined) {
    if (type === undefined) {
      return;
    }
    this.current?.getData().types.push({name, identifier: type});
  }

  public addClassDefinition(c: IClassDefinition) {
    this.current?.getData().cdefs.push(c);
  }

  public addFormDefinitions(f: readonly IFormDefinition[]) {
    if (this.current === undefined) {
      return;
    }
    this.current.getData().forms = this.current.getData().forms.concat(f);
  }

  public addInterfaceDefinition(i: IInterfaceDefinition) {
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

  public addDeferred(name: string | undefined, type: DeferredType) {
    if (name === undefined) {
      return;
    }
    this.current?.getData().deferred.push({name, type});
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
    this.addReference(token, resolved, ReferenceType.DataReadReference, filename);
  }

  public addWrite(token: Token, resolved: TypedIdentifier, filename: string) {
    this.addReference(token, resolved, ReferenceType.DataWriteReference, filename);
  }

  public addReference(token: Token | undefined, resolved: Identifier, type: ReferenceType, filename: string, extra?: IReferenceExtras) {
    if (token === undefined) {
      return;
    }

    const position = new Identifier(token, filename);
    this.current?.getData().references.push({position, resolved, referenceType: type, extra});
  }

///////////////////////////

  public findObjectDefinition(name: string | undefined): IClassDefinition | IInterfaceDefinition | undefined {
    if (name === undefined) {
      return undefined;
    }
    const clas = this.findClassDefinition(name);
    if (clas) {
      return clas;
    }
    const intf = this.findInterfaceDefinition(name);
    if (intf) {
      return intf;
    }
    return undefined;
  }

  public existsObject(name: string | undefined): boolean {
    if (name === undefined) {
      return false;
    }

    if (name.toUpperCase() === "OBJECT") {
      return true;
    } else if (name.toUpperCase() === this.getName().toLocaleUpperCase()
        && this.getType() === ScopeType.ClassDefinition) {
      return true;
    } else if (this.current?.findDeferred(name) !== undefined) {
      return true;
    } else if (this.current?.findClassDefinition(name)) {
      return true;
    } else if (this.reg.getObject("CLAS", name)) {
      return true;
    } else if (this.current?.findInterfaceDefinition(name)) {
      return true;
    } else if (this.reg.getObject("INTF", name)) {
      return true;
    }

    return false;
  }

///////////////////////////

  public findClassDefinition(name: string | undefined): IClassDefinition | undefined {
    if (name === undefined) {
      return undefined;
    }

    const clocal = this.current?.findClassDefinition(name);
    if (clocal) {
      return clocal;
    }

    const cglobal = this.reg.getObject("CLAS", name) as Class | undefined;
    if (cglobal) {
      return cglobal.getDefinition();
    }

    return undefined;
  }

  public findInterfaceDefinition(name: string): IInterfaceDefinition | undefined {
    const ilocal = this.current?.findInterfaceDefinition(name);
    if (ilocal) {
      return ilocal;
    }

    const iglobal = this.reg.getObject("INTF", name) as Interface | undefined;
    if (iglobal) {
      return iglobal.getDefinition();
    }

    return undefined;
  }

  public findFormDefinition(name: string): IFormDefinition | undefined {
    return this.current?.findFormDefinition(name);
  }

  public listFormDefinitions(): IFormDefinition[] {
    const ret = this.current?.listFormDefinitions();
    if (ret === undefined) {
      return [];
    }
    return ret;
  }

  public findType(name: string | undefined): TypedIdentifier | undefined {
    if (name === undefined) {
      return undefined;
    }
    return this.current?.findType(name);
  }

  public findVariable(name: string | undefined): TypedIdentifier | undefined {
    if (name === undefined) {
      return undefined;
    }
    return this.current?.findVariable(name);
  }

///////////////////////////

  public getDDIC(): DDIC {
    return new DDIC(this.reg);
  }

  public getName(): string {
    if (this.current === undefined) {
      throw new Error("error, getName");
    }
    return this.current.getIdentifier().sname;
  }

  public getType(): ScopeType {
    if (this.current === undefined) {
      throw new Error("error, getType");
    }
    return this.current.getIdentifier().stype;
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
