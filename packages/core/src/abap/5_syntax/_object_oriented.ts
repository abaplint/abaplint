import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {StatementNode} from "../nodes";
import {CurrentScope} from "./_current_scope";
import {IClassDefinition} from "../types/_class_definition";
import {IMethodDefinition} from "../types/_method_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {ClassAttribute} from "../types/class_attribute";
import {ClassConstant} from "../types/class_constant";

// todo, think some of the public methods can be made private

export class ObjectOriented {
  private readonly scope: CurrentScope;

  public constructor(scope: CurrentScope) {
    this.scope = scope;
  }

  public fromInterfaces(classDefinition: IClassDefinition): void {
    for (const i of classDefinition.getImplementing()) {
      const idef = this.scope.findInterfaceDefinition(i.name);
      if (idef === undefined) {
        continue;
      }

      for (const t of idef.getTypeDefinitions().getAll()) {
        const name = i.name + "~" + t.getName();
        this.scope.addTypeNamed(name, t);
      }
    }
  }

  public addAliasedAttributes(classDefinition: IClassDefinition): void {
    for (const alias of classDefinition.getAliases().getAll()) {
      const comp = alias.getComponent();
      const idef = this.scope.findInterfaceDefinition(comp.split("~")[0]);
      if (idef) {
        const found = idef.getAttributes()!.findByName(comp.split("~")[1]);
        if (found) {
          this.scope.addNamedIdentifier(alias.getName(), found);
        }
      }
    }
  }

  public findMethodInInterface(interfaceName: string, methodName: string): IMethodDefinition | undefined {
    const idef = this.scope.findInterfaceDefinition(interfaceName);
    if (idef) {
      const methods = idef.getMethodDefinitions().getAll();
      for (const method of methods) {
        if (method.getName().toUpperCase() === methodName.toUpperCase()) {
          return method;
        }
      }
    }
    return undefined;
  }

  public findMethodViaAlias(methodName: string, def: IClassDefinition | IInterfaceDefinition): IMethodDefinition | undefined {
    for (const a of def.getAliases().getAll()) {
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

  public findInterfaces(cd: IClassDefinition): readonly {name: string, partial: boolean}[] {
    let ret = cd.getImplementing();

    const sup = cd.getSuperClass();
    if (sup) {
      try {
        ret = ret.concat(this.findInterfaces(this.findSuperDefinition(sup)));
      } catch {
// ignore errors, they will show up as variable not found anyhow
      }
    }

    return ret;
  }

  // search in via super class, interfaces and aliases
  public searchAttributeName(
    def: IClassDefinition | IInterfaceDefinition | undefined,
    name: string | undefined): ClassAttribute | undefined {

    if (def === undefined || name === undefined) {
      return undefined;
    }

    for (const a of def.getAttributes().getAll()) {
      if (a.getName().toUpperCase() === name.toUpperCase()) {
        return a;
      }
    }

    if (name.includes("~")) {
      const interfaceName = name.split("~")[0];
      if (def.getImplementing().some((a) => a.name.toUpperCase() === interfaceName.toUpperCase())) {
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
  public searchConstantName(
    def: IClassDefinition | IInterfaceDefinition | undefined,
    name: string | undefined): ClassConstant | undefined {

    if (def === undefined || name === undefined) {
      return undefined;
    }

    for (const a of def.getAttributes().getConstants()) {
      if (a.getName().toUpperCase() === name.toUpperCase()) {
        return a;
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
    name: string | undefined): IMethodDefinition | undefined {

    if (def === undefined || name === undefined) {
      return undefined;
    }

    let methodDefinition = this.findMethod(def, name);

    let interfaceName: string | undefined = undefined;
    if (name.includes("~")) {
      interfaceName = name.split("~")[0];
    }

// todo, this is not completely correct? hmm, why? visibility?
    if (methodDefinition === undefined && interfaceName) {
      name = name.split("~")[1];
      methodDefinition = this.findMethodInInterface(interfaceName, name);
    } else if (methodDefinition === undefined) {
      methodDefinition = this.findMethodViaAlias(name, def);
    }

    const sup = def.getSuperClass();
    if (methodDefinition === undefined && sup) {
      methodDefinition = this.searchMethodName(this.findSuperDefinition(sup), name);
    }

    return methodDefinition;
  }

  public findMethod(def: IClassDefinition | IInterfaceDefinition, methodName: string): IMethodDefinition | undefined {
    for (const method of def.getMethodDefinitions()!.getAll()) {
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
      throw new Error("super class \"" + name + "\" not found or contains errors");
    }
    return csup;
  }

  public fromSuperClass(child: IClassDefinition) {
    let sup = child.getSuperClass();
    while (sup !== undefined) {
      const cdef = this.findSuperDefinition(sup);
      this.scope.addList(cdef.getAttributes().getAll()); // todo, handle scope and instance vs static
      this.scope.addList(cdef.getAttributes().getConstants());
      for (const t of cdef.getTypeDefinitions().getAll()) {
        this.scope.addType(t);
      }
      sup = cdef.getSuperClass();
    }
  }

}