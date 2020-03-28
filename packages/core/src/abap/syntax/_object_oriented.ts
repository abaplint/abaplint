import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {StatementNode} from "../nodes";
import {ClassDefinition, MethodDefinition, InterfaceDefinition} from "../types";
import {Interface, Class} from "../../objects";
import {IRegistry} from "../../_iregistry";
import {CurrentScope} from "./_current_scope";
import {ScopeType} from "./_scope_type";
import {ObjectReferenceType} from "../types/basic";
import {Identifier} from "../1_lexer/tokens";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Position} from "../../position";
import {BuiltIn} from "./_builtin";

export class ObjectOriented {
  private readonly reg: IRegistry;
  private readonly scope: CurrentScope;

  public constructor(reg: IRegistry, scope: CurrentScope) {
    this.reg = reg;
    this.scope = scope;
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

  public classDefinition(node: StatementNode, filename: string) {
    this.scope.push(ScopeType.ClassDefinition, this.findClassName(node), node.getFirstToken().getStart(), filename);
// todo
  }

  public classImplementation(node: StatementNode, filename: string) {
    const className = this.findClassName(node);
    this.scope.push(ScopeType.ClassImplementation, className, node.getFirstToken().getStart(), filename);

    const classDefinition = this.findClassDefinition(className);

    const classAttributes = classDefinition.getAttributes(this.scope);

    this.addAliasedAttributes(classDefinition); // todo, this is not correct, take care of instance vs static

    this.scope.addList(classAttributes.getConstants());
    this.scope.addList(classAttributes.getInstance()); // todo, this is not correct, take care of instance vs static
    this.scope.addList(classAttributes.getStatic()); // todo, this is not correct, take care of instance vs static

    this.fromSuperClass(classDefinition);
  }

  private findInterfaceDefinition(name: string): InterfaceDefinition | undefined {
    const intf = this.reg.getObject("INTF", name) as Interface;
    if (intf && intf.getDefinition()) {
      return intf.getDefinition();
    }

    const found = this.scope.findInterfaceDefinition(name);
    if (found) {
      return found;
    }

    return undefined;
  }

  private addAliasedAttributes(classDefinition: ClassDefinition): void {
    for (const alias of classDefinition.getAliases().getAll()) {
      const comp = alias.getComponent();
      const idef = this.findInterfaceDefinition(comp.split("~")[0]);
      if (idef) {
        const found = idef.getAttributes(this.scope)!.findByName(comp.split("~")[1]);
        if (found) {
          this.scope.addNamedIdentifier(alias.getName(), found);
        }
      }
    }
  }

  private findMethodInInterface(interfaceName: string, methodName: string): MethodDefinition | undefined {
    const idef = this.findInterfaceDefinition(interfaceName);
    if (idef) {
      const methods = idef.getMethodDefinitions(this.scope);
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

  public methodImplementation(node: StatementNode, filename: string) {
    const className = this.scope.getName();
    let methodName = node.findFirstExpression(Expressions.MethodName)!.getFirstToken().getStr();
    this.scope.push(ScopeType.Method, methodName, node.getFirstToken().getStart(), filename);

    const classDefinition = this.findClassDefinition(className);
    classDefinition.getTypeDefinitions(this.scope).getAll().map((t) => this.scope.addType(t));

    const sup = classDefinition.getSuperClass();
    if (sup) {
      this.scope.addIdentifier(new TypedIdentifier(new Identifier(new Position(1, 1), "super"), BuiltIn.filename, new ObjectReferenceType(sup)));
    }
    this.scope.addIdentifier(new TypedIdentifier(new Identifier(new Position(1, 1), "me"), BuiltIn.filename, new ObjectReferenceType(className)));

    let methodDefinition = this.findMethod(classDefinition, methodName);

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
      this.scope.pop();
      if (interfaceName) {
        throw new Error("Method definition \"" + methodName + "\" in \"" + interfaceName + "\" not found");
      } else {
        throw new Error("Method definition \"" + methodName + "\" not found");
      }
    }

    this.scope.addList(methodDefinition.getParameters().getAll());

    for (const i of this.findInterfaces(classDefinition)) {
      const idef = this.findInterfaceDefinition(i.name);
      if (idef) {
        this.scope.addListPrefix(idef.getAttributes(this.scope)!.getConstants(), i.name + "~");
        this.scope.addListPrefix(idef.getAttributes(this.scope)!.getStatic(), i.name + "~");
        // todo, only add instance variables if its an instance method
        this.scope.addListPrefix(idef.getAttributes(this.scope)!.getInstance(), i.name + "~");
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
    const found = this.scope.findClassDefinition(name);
    if (found) {
      return found;
    }
    throw new Error("Class definition for \"" + name + "\" not found");
  }

  private findMethod(classDefinition: ClassDefinition, methodName: string): MethodDefinition | undefined {
    for (const method of classDefinition.getMethodDefinitions(this.scope)!.getAll()) {
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

    const attr = cdef.getAttributes(this.scope);

    this.scope.addList(attr.getConstants()); // todo, handle scope and instance vs static
    this.scope.addList(attr.getInstance()); // todo, handle scope and instance vs static
    this.scope.addList(attr.getStatic()); // todo, handle scope and instance vs static

    this.fromSuperClass(cdef);
  }

}