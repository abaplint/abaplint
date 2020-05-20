import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {StatementNode} from "../nodes";
import {IRegistry} from "../../_iregistry";
import {CurrentScope} from "./_current_scope";
import {ScopeType} from "./_scope_type";
import {ObjectReferenceType} from "../types/basic";
import {Identifier} from "../1_lexer/tokens";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Position} from "../../position";
import {BuiltIn} from "./_builtin";
import {IClassDefinition} from "../types/_class_definition";
import {IMethodDefinition} from "../types/_method_definition";

export class ObjectOriented {
  private readonly scope: CurrentScope;

  public constructor(_reg: IRegistry, scope: CurrentScope) {
    this.scope = scope;
  }

  private findClassName(node: StatementNode): string {
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

  public classImplementation(node: StatementNode, filename: string) {
    const className = this.findClassName(node);
    this.scope.push(ScopeType.ClassImplementation, className, node.getFirstToken().getStart(), filename);

    const classDefinition = this.scope.findClassDefinition(className);
    if (classDefinition === undefined) {
      throw new Error("Class definition for \"" + className + "\" not found");
    }
    const classAttributes = classDefinition.getAttributes();

    this.addAliasedAttributes(classDefinition); // todo, this is not correct, take care of instance vs static

    this.scope.addList(classAttributes.getConstants());
    this.scope.addList(classAttributes.getInstance()); // todo, this is not correct, take care of instance vs static
    this.scope.addList(classAttributes.getStatic()); // todo, this is not correct, take care of instance vs static

    this.fromSuperClass(classDefinition);
  }

  private addAliasedAttributes(classDefinition: IClassDefinition): void {
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

  private findMethodInInterface(interfaceName: string, methodName: string): IMethodDefinition | undefined {
    const idef = this.scope.findInterfaceDefinition(interfaceName);
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

  private findMethodViaAlias(methodName: string, classDefinition: IClassDefinition): IMethodDefinition | undefined {
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

    const classDefinition = this.scope.findClassDefinition(className);
    if (classDefinition === undefined) {
      throw new Error("Class definition for \"" + className + "\" not found");
    }
    classDefinition.getTypeDefinitions().getAll().map((t) => this.scope.addType(t));

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
      const idef = this.scope.findInterfaceDefinition(i.name);
      if (idef) {
        this.scope.addListPrefix(idef.getAttributes()!.getConstants(), i.name + "~");
        this.scope.addListPrefix(idef.getAttributes()!.getStatic(), i.name + "~");
        // todo, only add instance variables if its an instance method
        this.scope.addListPrefix(idef.getAttributes()!.getInstance(), i.name + "~");
      }
    }
  }

  private findInterfaces(cd: IClassDefinition): readonly {name: string, partial: boolean}[] {
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

  private findMethod(classDefinition: IClassDefinition, methodName: string): IMethodDefinition | undefined {
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

  private findMethodInSuper(child: IClassDefinition, methodName: string): IMethodDefinition | undefined {
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

  private findSuperDefinition(name: string): IClassDefinition {
    const csup = this.scope.findClassDefinition(name);
    if (csup === undefined) {
      throw new Error("super class \"" + name + "\" not found or contains errors");
    }
    return csup;
  }

  private fromSuperClass(child: IClassDefinition) {
    const sup = child.getSuperClass();
    if (sup === undefined) {
      return;
    }
    const cdef = this.findSuperDefinition(sup);

    const attr = cdef.getAttributes();

    this.scope.addList(attr.getConstants()); // todo, handle scope and instance vs static
    this.scope.addList(attr.getInstance()); // todo, handle scope and instance vs static
    this.scope.addList(attr.getStatic()); // todo, handle scope and instance vs static

    this.fromSuperClass(cdef);
  }

}