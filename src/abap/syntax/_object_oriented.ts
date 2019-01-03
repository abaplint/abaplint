import * as Statements from "../statements";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {ABAPObject} from "../../objects/_abap_object";
import {ClassDefinition, MethodDefinition} from "../types";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Interface} from "../../objects";
import {Registry} from "../../registry";
import {Globals} from "./_globals";
import {MemoryFile} from "../../files";

export class ObjectOriented {
  private obj: ABAPObject;
  private reg: Registry;

  constructor(obj: ABAPObject, reg: Registry) {
    this.obj = obj;
    this.reg = reg;
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

  public classDefinition(_node: StatementNode): TypedIdentifier[] {
// todo
    return [];
  }

  public classImplementation(node: StatementNode): TypedIdentifier[] {
    const className = this.findClassName(node);

    const classDefinition = this.findDefinition(className);
    if (classDefinition === undefined) {
      throw new Error("Class definition \"" + className + "\" not found");
    }

    const classAttributes = classDefinition.getAttributes();
    if (classAttributes === undefined) {
      throw new Error("Error reading class attributes");
    }

  // todo, also add attributes and constants from super classes
    let ret: TypedIdentifier[] = [];
    ret = ret.concat(classAttributes.getConstants());
    ret = ret.concat(classAttributes.getInstance()); // todo, this is not correct, take care of scope
    ret = ret.concat(classAttributes.getStatic()); // todo, this is not correct, take care of scope
    return ret;
  }

  public methodImplementation(className: string, node: StatementNode): TypedIdentifier[] {
    const classDefinition = this.findDefinition(className);

    let methodName = node.findFirstExpression(Expressions.MethodName)!.getFirstToken().getStr();
    let methodDefinition: MethodDefinition | undefined = undefined;
    for (const method of classDefinition.getMethodDefinitions()!.getAll()) {
      if (method.getName().toUpperCase() === methodName.toUpperCase()) {
        methodDefinition = method;
      }
    }

// todo, this is not completely correct, and too much code
    if (methodName.includes("~")) {
      const interfaceName = methodName.split("~")[0];
      methodName = methodName.split("~")[1];
      const intf = this.reg.getObject("INTF", interfaceName) as Interface;
      if (intf && intf.getDefinition()) {
        const methods = intf.getDefinition()!.getMethodDefinitions();
        for (const method of methods) {
          if (method.getName().toUpperCase() === methodName.toUpperCase()) {
            methodDefinition = method;
            break;
          }
        }
      }
    }

    if (methodDefinition === undefined) {
      throw new Error("Method definition \"" + methodName + "\" not found");
    }

// todo, this is not correct, add correct types, plus when is "super" allowed?
    const file = new MemoryFile("_method_locals.prog.abap", "* Method Locals\n" +
      "DATA super TYPE REF TO object.\n" +
      "DATA me TYPE REF TO object.\n");
    const builtIn = Globals.typesInFile(file);

    return methodDefinition.getParameters().getAll().concat(builtIn);
  }

  private findDefinition(name: string): ClassDefinition {
    for (const file of this.obj.getABAPFiles()) {
      const found = file.getClassDefinition(name);
      if (found) {
        return found;
      }
    }
    throw new Error("Class defintion for \"" + name + "\" not found");
  }

}