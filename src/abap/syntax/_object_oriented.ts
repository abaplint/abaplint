import * as Statements from "../statements";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {ABAPObject} from "../../objects/_abap_object";
import {ClassDefinition, MethodDefinition, InterfaceDefinition} from "../types";
import {Interface, Class} from "../../objects";
import {Registry} from "../../registry";
import {ScopedVariables} from "./_scoped_variables";

export class ObjectOriented {
  private readonly obj: ABAPObject;
  private readonly reg: Registry;
  private readonly variables: ScopedVariables;

  constructor(obj: ABAPObject, reg: Registry, variables: ScopedVariables) {
    this.obj = obj;
    this.reg = reg;
    this.variables = variables;
  }

  public findClassName(node: StatementNode): string {
    if (!(node.get() instanceof Statements.ClassImplementation
        || node.get() instanceof Statements.ClassDefinition)) {
      throw new Error("findClassName, unexpected node type");
    }
    const blah = node.findFirstExpression(Expressions.ClassName);
    if (blah === undefined) {
      throw new Error("findClassName, unexpected node type");
    }
    return blah.getFirstToken().getStr();
  }

  public classDefinition(node: StatementNode) {
    this.variables.pushScope(this.findClassName(node));
// todo
  }

  public classImplementation(node: StatementNode) {
    const className = this.findClassName(node);
    this.variables.pushScope(className);

    const classDefinition = this.findClassDefinition(className);

    const classAttributes = classDefinition.getAttributes();

    this.addAliasedAttributes(classDefinition); // todo, this is not correct, take care of instance vs static

    this.variables.addList(classAttributes.getConstants());
    this.variables.addList(classAttributes.getInstance()); // todo, this is not correct, take care of instance vs static
    this.variables.addList(classAttributes.getStatic()); // todo, this is not correct, take care of instance vs static

    this.fromSuperClass(classDefinition);
  }

  private findInterfaceDefinition(name: string): InterfaceDefinition | undefined {
    const intf = this.reg.getObject("INTF", name) as Interface;
    if (intf && intf.getDefinition()) {
      return intf.getDefinition();
    }
// todo, this is not correct, global classes cannot implement local interfaces
    for (const file of this.obj.getABAPFiles()) {
      const found = file.getInterfaceDefinition(name);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  private addAliasedAttributes(classDefinition: ClassDefinition): void {
    for (const alias of classDefinition.getAliases().getAll()) {
      const comp = alias.getComponent();
      const idef = this.findInterfaceDefinition(comp.split("~")[0]);
      if (idef) {
        const found = idef.getAttributes()!.findByName(comp.split("~")[1]);
        if (found) {
          this.variables.addNamedIdentifier(alias.getName(), found);
        }
      }
    }
  }

  private findMethodInInterface(interfaceName: string, methodName: string): MethodDefinition | undefined {
    const idef = this.findInterfaceDefinition(interfaceName);
    if (idef) {
      const methods = idef.getMethodDefinitions();
      for (const method of methods) {
        if (method.getName().toUpperCase() === methodName.toUpperCase()) {
          return method;
        }
      }
    }
    return undefined;
  }

  private findMethodViaAlias(methodName: string, classDefinition: ClassDefinition): MethodDefinition | undefined {
    for (const a of classDefinition.getAliases().getAll()) {
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

  public methodImplementation(node: StatementNode) {
    this.variables.pushScope("method");
    const className = this.variables.getParentName();
    const classDefinition = this.findClassDefinition(className);

// todo, this is not correct, add correct types, plus when is "super" allowed?
    this.variables.addName("super");
    this.variables.addName("me");

    let methodName = node.findFirstExpression(Expressions.MethodName)!.getFirstToken().getStr();

    let methodDefinition: MethodDefinition | undefined = undefined;
    methodDefinition = this.findMethod(classDefinition, methodName);

    let interfaceName: string | undefined = undefined;
    if (methodName.includes("~")) {
      interfaceName = methodName.split("~")[0];
    }

// todo, this is not completely correct? hmm, why? visibility?
    if (methodDefinition === undefined && interfaceName) {
      methodName = methodName.split("~")[1];
      methodDefinition = this.findMethodInInterface(interfaceName, methodName);
    } else if (methodDefinition === undefined) {
      methodDefinition = this.findMethodViaAlias(methodName, classDefinition);
    }

    if (methodDefinition === undefined) {
      this.variables.popScope();
      if (interfaceName) {
        throw new Error("Method definition \"" + methodName + "\" in \"" + interfaceName + "\" not found");
      } else {
        throw new Error("Method definition \"" + methodName + "\" not found");
      }
    }

    this.variables.addList(methodDefinition.getParameters().getAll());

    for (const i of this.findInterfaces(classDefinition)) {
      const idef = this.findInterfaceDefinition(i.name);
      if (idef) {
        this.variables.addList(idef.getAttributes()!.getConstants(), i.name + "~");
        this.variables.addList(idef.getAttributes()!.getStatic(), i.name + "~");
        // todo, only add instance if its an instance method
        this.variables.addList(idef.getAttributes()!.getInstance(), i.name + "~");
      }
    }
  }

  private findInterfaces(cd: ClassDefinition): {name: string, partial: boolean}[] {
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

  private findClassDefinition(name: string): ClassDefinition {
    for (const file of this.obj.getABAPFiles()) {
      const found = file.getClassDefinition(name);
      if (found) {
        return found;
      }
    }
    throw new Error("Class definition for \"" + name + "\" not found");
  }

  private findMethod(classDefinition: ClassDefinition, methodName: string): MethodDefinition | undefined {
    for (const method of classDefinition.getMethodDefinitions()!.getAll()) {
      if (method.getName().toUpperCase() === methodName.toUpperCase()) {
        if (method.isRedefinition()) {
          return this.findMethodInSuper(classDefinition, methodName);
        } else {
          return method;
        }
      }
    }
    return undefined;
  }

  private findMethodInSuper(child: ClassDefinition, methodName: string): MethodDefinition | undefined {
    const sup = child.getSuperClass();
    if (sup === undefined) {
      return;
    }
    const cdef = this.findSuperDefinition(sup);
    const found = this.findMethod(cdef, methodName);
    if (found) {
      return found;
    }

    return this.findMethodInSuper(cdef, methodName);
  }

  private findSuperDefinition(name: string): ClassDefinition {
    const csup = this.reg.getObject("CLAS", name) as Class | undefined;
    if (csup === undefined) {
      const found = this.findClassDefinition(name);
      if (found) {
        return found;
      }
    }
    if (csup === undefined) {
      throw new Error("super class \"" + name + "\" not found");
    }

    const cdef = csup.getClassDefinition();
    if (cdef === undefined) {
      throw new Error("super class \"" + name + "\" contains errors");
    }
    return cdef;
  }

  private fromSuperClass(child: ClassDefinition) {
    const sup = child.getSuperClass();
    if (sup === undefined) {
      return;
    }
    const cdef = this.findSuperDefinition(sup);

    const attr = cdef.getAttributes();

    this.variables.addList(attr.getConstants()); // todo, handle scope and instance vs static
    this.variables.addList(attr.getInstance()); // todo, handle scope and instance vs static
    this.variables.addList(attr.getStatic()); // todo, handle scope and instance vs static

    this.fromSuperClass(cdef);
  }

}