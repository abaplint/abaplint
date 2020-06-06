import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {ObjectOriented} from "../_object_oriented";
import {ScopeType} from "../_scope_type";

export class MethodImplementation {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const helper = new ObjectOriented(scope);

    const className = scope.getName();
    let methodName = node.findFirstExpression(Expressions.MethodName)!.getFirstToken().getStr();
    scope.push(ScopeType.Method, methodName, node.getFirstToken().getStart(), filename);

    const classDefinition = scope.findClassDefinition(className);
    if (classDefinition === undefined) {
      throw new Error("Class definition for \"" + className + "\" not found");
    }

    let methodDefinition = helper.findMethod(classDefinition, methodName);

    let interfaceName: string | undefined = undefined;
    if (methodName.includes("~")) {
      interfaceName = methodName.split("~")[0];
    }

// todo, this is not completely correct? hmm, why? visibility?
    if (methodDefinition === undefined && interfaceName) {
      methodName = methodName.split("~")[1];
      methodDefinition = helper.findMethodInInterface(interfaceName, methodName);
    } else if (methodDefinition === undefined) {
      methodDefinition = helper.findMethodViaAlias(methodName, classDefinition);
    }

    if (methodDefinition === undefined) {
      scope.pop();
      if (interfaceName) {
        throw new Error("Method definition \"" + methodName + "\" in \"" + interfaceName + "\" not found");
      } else {
        throw new Error("Method definition \"" + methodName + "\" not found");
      }
    }

    scope.addList(methodDefinition.getParameters().getAll());

    for (const i of helper.findInterfaces(classDefinition)) {
      const idef = scope.findInterfaceDefinition(i.name);
      if (idef) {
        scope.addListPrefix(idef.getAttributes()!.getConstants(), i.name + "~");
        scope.addListPrefix(idef.getAttributes()!.getStatic(), i.name + "~");
        // todo, only add instance variables if its an instance method
        scope.addListPrefix(idef.getAttributes()!.getInstance(), i.name + "~");
      }
    }
  }
}