import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {StatementNode} from "../nodes";
import {CurrentScope} from "./_current_scope";
import {IClassDefinition} from "../types/_class_definition";
import {IMethodDefinition} from "../types/_method_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {ClassAttribute} from "../types/class_attribute";
import {ClassConstant} from "../types/class_constant";
import {IEventDefinition} from "../types/_event_definition";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Visibility} from "../4_file_information/visibility";

// todo, think some of the public methods can be made private
// todo: changet this class to static? for performance
export class ObjectOriented {
  private readonly scope: CurrentScope;

  public constructor(scope: CurrentScope) {
    this.scope = scope;
  }

  private fromInterfaceByName(name: string, ignore: string[]): string[] {
    const idef = this.scope.findInterfaceDefinition(name);
    if (idef === undefined || ignore.includes(name.toUpperCase())) {
      return [];
    }
    const ret: string[] = [name.toUpperCase()];

    for (const t of idef.getTypeDefinitions().getAll()) {
      const n = name + "~" + t.type.getName();
      this.scope.addTypeNamed(n, t.type);
    }

    this.scope.addListPrefix(idef.getAttributes().getConstants(), name + "~");
    this.scope.addListPrefix(idef.getAttributes().getStatic(), name + "~");
    this.scope.addListPrefix(idef.getAttributes().getInstance(), name + "~");

    for (const i of idef.getImplementing()) {
      if (ignore.includes(i.name.toUpperCase())) {
        continue;
      }
      ret.push(...this.fromInterfaceByName(i.name, ignore));
      ignore.push(i.name.toUpperCase());
      ret.push(i.name.toUpperCase());
    }
    return ret;
  }

  public addAliasedAttributes(classDefinition: IClassDefinition): void {
    for (const alias of classDefinition.getAliases()) {
      const comp = alias.getComponent();
      const idef = this.scope.findInterfaceDefinition(comp.split("~")[0]);
      if (idef) {
        const found = idef.getAttributes()!.findByName(comp.split("~")[1]);
        if (found) {
          this.scope.addNamedIdentifier(alias.getName(), found);
        }
      }
    }
    const superName = classDefinition.getSuperClass();
    if (superName !== undefined) {
      const def = this.scope.findClassDefinition(superName);
      if (def) {
        this.addAliasedAttributes(def);
      }
    }
  }

  private findMethodInInterface(interfaceName: string, methodName: string):
  {method: IMethodDefinition, def: IInterfaceDefinition} | undefined {

    const idef = this.scope.findInterfaceDefinition(interfaceName);
    if (idef) {
      const methods = idef.getMethodDefinitions().getAll();
      for (const method of methods) {
        if (method.getName().toUpperCase() === methodName.toUpperCase()) {
          return {method, def: idef};
        }
      }
      return this.findMethodViaAlias(methodName, idef);
    }
    return undefined;
  }

  private findMethodViaAlias(methodName: string, def: IClassDefinition | IInterfaceDefinition):
  {method: IMethodDefinition, def: IInterfaceDefinition} | undefined {

    for (const a of def.getAliases()) {
      if (a.getName().toUpperCase() === methodName.toUpperCase()) {
        const comp = a.getComponent();
        const res = this.findMethodInInterface(comp.split("~")[0], comp.split("~")[1]);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }

  public findClassName(node: StatementNode): string {
    if (!(node.get() instanceof Statements.ClassImplementation
        || node.get() instanceof Statements.ClassDefinition)) {
      throw new Error("findClassName, unexpected node type");
    }
    const className = node.findFirstExpression(Expressions.ClassName);
    if (className === undefined) {
      throw new Error("findClassName, unexpected node type");
    }
    return className.getFirstToken().getStr();
  }

  public findInterfaces(cd: IClassDefinition | IInterfaceDefinition): readonly {name: string, partial: boolean}[] {
    const ret = [...cd.getImplementing()];

    for (const r of ret) {
      const nested = this.scope.findInterfaceDefinition(r.name)?.getImplementing();
      if (nested) {
        ret.push(...nested);
      }
    }

    const sup = cd.getSuperClass();
    if (sup) {
      try {
        ret.push(...this.findInterfaces(this.findSuperDefinition(sup)));
      } catch {
// ignore errors, they will show up as variable not found anyhow
      }
    }

    return ret;
  }

  public searchEvent(
    def: IClassDefinition | IInterfaceDefinition | undefined,
    name: string | undefined): IEventDefinition | undefined {

    if (def === undefined || name === undefined) {
      return undefined;
    }

    const found = def.getEvents().find(e => e.getName().toUpperCase() === name?.toUpperCase());
    if (found) {
      return found;
    }

    for (const a of def.getAliases() || []) {
      if (a.getName().toUpperCase() === name.toUpperCase()) {
        const comp = a.getComponent();
        const res = this.searchEvent(this.scope.findObjectDefinition(comp.split("~")[0]), comp.split("~")[1]);
        if (res) {
          return res;
        }
      }
    }

    const sup = def.getSuperClass();
    if (sup) {
      return this.searchEvent(this.findSuperDefinition(sup), name);
    }

    return undefined;
  }

  // search in via super class, interfaces and aliases
  public searchAttributeName(
    def: IClassDefinition | IInterfaceDefinition | undefined,
    name: string | undefined): ClassAttribute | undefined {

    if (def === undefined || name === undefined) {
      return undefined;
    }

    const upper = name.toUpperCase();
    for (const a of def.getAttributes().getAll()) {
      if (a.getName().toUpperCase() === upper) {
        return a;
      }
    }

    for (const a of def.getAliases() || []) {
      if (a.getName().toUpperCase() === upper) {
        const comp = a.getComponent();
        const res = this.searchAttributeName(this.scope.findObjectDefinition(comp.split("~")[0]), comp.split("~")[1]);
        if (res) {
          return res;
        }
      }
    }

    if (name.includes("~")) {
      const interfaceName = upper.split("~")[0];
      if (this.listInterfacesRecursive(def).includes(interfaceName)) {
        return this.searchAttributeName(this.scope.findInterfaceDefinition(interfaceName), name.split("~")[1]);
      }
    }

    const sup = def.getSuperClass();
    if (sup) {
      return this.searchAttributeName(this.findSuperDefinition(sup), name);
    }

    return undefined;
  }

  // search in via super class, interfaces and aliases
  public searchTypeName(
    def: IClassDefinition | IInterfaceDefinition | undefined,
    name: string | undefined): TypedIdentifier | undefined {

    if (def === undefined || name === undefined) {
      return undefined;
    }

    const search = def.getTypeDefinitions().getByName(name);
    if (search) {
      return search;
    }

    if (name.includes("~")) {
      const interfaceName = name.split("~")[0];
      if (def.getImplementing().some((a) => a.name.toUpperCase() === interfaceName.toUpperCase())) {
        return this.searchTypeName(this.scope.findInterfaceDefinition(interfaceName), name.split("~")[1]);
      }
    }

    const sup = def.getSuperClass();
    if (sup) {
      return this.searchTypeName(this.findSuperDefinition(sup), name);
    }

    return undefined;
  }

  // search in via super class, interfaces and aliases
  public searchConstantName(
    def: IClassDefinition | IInterfaceDefinition | undefined,
    name: string | undefined): ClassConstant | undefined {

    if (def === undefined || name === undefined) {
      return undefined;
    }

    const upper = name.toUpperCase();
    for (const a of def.getAttributes().getConstants()) {
      if (a.getName().toUpperCase() === upper) {
        return a;
      }
    }

    for (const a of def.getAliases()) {
      if (a.getName().toUpperCase() === upper) {
        const comp = a.getComponent();
        const res = this.searchConstantName(this.scope.findObjectDefinition(comp.split("~")[0]), comp.split("~")[1]);
        if (res) {
          return res;
        }
      }
    }

    if (name.includes("~")) {
      const interfaceName = upper.split("~")[0];
      if (def.getImplementing().some((a) => a.name.toUpperCase() === interfaceName)) {
        return this.searchConstantName(this.scope.findInterfaceDefinition(interfaceName), name.split("~")[1]);
      }
    }

    const sup = def.getSuperClass();
    if (sup) {
      return this.searchConstantName(this.findSuperDefinition(sup), name);
    }

    return undefined;
  }

  // search in via super class, interfaces and aliases
  public searchMethodName(
    def: IClassDefinition | IInterfaceDefinition | undefined,
    name: string | undefined): {method: IMethodDefinition | undefined, def: IClassDefinition | IInterfaceDefinition | undefined} {

    if (def === undefined || name === undefined) {
      return {method: undefined, def: undefined};
    }

    const methodDefinition = this.findMethod(def, name);
    if (methodDefinition) {
      return {method: methodDefinition, def};
    }

    let interfaceName: string | undefined = undefined;
    if (name.includes("~")) {
      interfaceName = name.split("~")[0];
      if (interfaceName && this.findInterfaces(def).some(i => i.name.toUpperCase() === interfaceName?.toUpperCase()) === false) {
        return {method: undefined, def: undefined};
      }
    }

// todo, this is not completely correct? hmm, why? visibility?
    if (methodDefinition === undefined && interfaceName) {
      name = name.split("~")[1];
      const found = this.findMethodInInterface(interfaceName, name);
      if (found) {
        return found;
      }
    } else if (methodDefinition === undefined) {
      const found = this.findMethodViaAlias(name, def);
      if (found) {
        return found;
      }
    }

    const sup = def.getSuperClass();
    if (methodDefinition === undefined && sup) {
      return this.searchMethodName(this.findSuperDefinition(sup), name);
    }

    return {method: undefined, def: undefined};
  }

  public findMethod(def: IClassDefinition | IInterfaceDefinition, methodName: string): IMethodDefinition | undefined {
    for (const method of def.getMethodDefinitions().getAll()) {
      if (method.getName().toUpperCase() === methodName.toUpperCase()) {
        if (method.isRedefinition()) {
          return this.findMethodInSuper(def, methodName);
        } else {
          return method;
        }
      }
    }
    return undefined;
  }

  private findMethodInSuper(child: IClassDefinition | IInterfaceDefinition, methodName: string): IMethodDefinition | undefined {
    let sup = child.getSuperClass();
    while (sup !== undefined) {
      const cdef = this.findSuperDefinition(sup);
      const found = this.findMethod(cdef, methodName);
      if (found) {
        return found;
      }
      sup = cdef.getSuperClass();
    }
    return undefined;
  }

  private findSuperDefinition(name: string): IClassDefinition {
    const csup = this.scope.findClassDefinition(name);
    if (csup === undefined) {
      throw new Error("Super class \"" + name + "\" not found or contains errors");
    }
    return csup;
  }

  public fromSuperClassesAndInterfaces(child: IClassDefinition) {
    const implemented = this.fromSuperClasses(child);
    this.fromInterfaces(child, implemented);
  }

  // returns list of interfaces implemented
  private fromSuperClasses(child: IClassDefinition): string[] {
    let sup = child.getSuperClass();
    const ignore: string[] = [];

    while (sup !== undefined) {
      const cdef = this.findSuperDefinition(sup);
      for (const a of cdef.getAttributes().getAll()) {
        if (a.getVisibility() !== Visibility.Private) {
          this.scope.addIdentifier(a);
// todo, handle scope and instance vs static
        }
      }
      for (const c of cdef.getAttributes().getConstants()) {
        if (c.getVisibility() !== Visibility.Private) {
          this.scope.addIdentifier(c);
        }
      }
      for (const t of cdef.getTypeDefinitions().getAll()) {
        if (t.visibility !== Visibility.Private) {
          this.scope.addType(t.type);
        }
      }
      ignore.push(...this.fromInterfaces(cdef, ignore));
      sup = cdef.getSuperClass();
    }

    return ignore;
  }

  /** returns list of interfaces implemented, recursive */
  public listInterfacesRecursive(definition: IInterfaceDefinition): string[] {
    const list: string[] = [];
    for (const i of definition.getImplementing()) {
      const upper = i.name.toUpperCase();
      list.push(upper);

      const def = this.scope.findInterfaceDefinition(upper);
      if (def) {
        list.push(...this.listInterfacesRecursive(def));
      }
    }

    return [...new Set(list)];
  }

  public fromInterfaces(definition: IInterfaceDefinition, skip?: string[]): string[] {
    const ignore: string[] = [];
    for (const i of definition.getImplementing()) {
      ignore.push(...this.fromInterfaceByName(i.name, ignore.concat(skip || [])));
    }
    return ignore;
  }

}
