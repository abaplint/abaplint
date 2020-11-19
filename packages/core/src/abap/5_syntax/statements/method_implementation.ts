import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {ObjectOriented} from "../_object_oriented";
import {ScopeType} from "../_scope_type";
import {ReferenceType} from "../_reference";

export class MethodImplementation {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const helper = new ObjectOriented(scope);

    const className = scope.getName();
    const methodToken = node.findFirstExpression(Expressions.MethodName)!.getFirstToken();
    const methodName = methodToken?.getStr();
    scope.push(ScopeType.Method, methodName, node.getFirstToken().getStart(), filename);

    const classDefinition = scope.findClassDefinition(className);
    if (classDefinition === undefined) {
      throw new Error("Class definition for \"" + className + "\" not found");
    }

    const {method: methodDefinition} = helper.searchMethodName(classDefinition, methodName);
    if (methodDefinition === undefined) {
      scope.pop();
      throw new Error("Method definition \"" + methodName + "\" not found");
    }

    scope.addList(methodDefinition.getParameters().getAll());

    for (const i of helper.findInterfaces(classDefinition)) {
      if (methodName.toUpperCase().startsWith(i.name.toUpperCase() + "~") === false) {
        continue;
      }
      const idef = scope.findInterfaceDefinition(i.name);
      if (idef === undefined) {
        continue;
      }
      scope.addReference(methodToken, idef, ReferenceType.ObjectOrientedReference, filename);
    }
  }
}