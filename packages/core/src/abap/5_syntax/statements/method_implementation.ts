import {StatementNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {ObjectOriented} from "../_object_oriented";
import {ScopeType} from "../_scope_type";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class MethodImplementation implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const helper = new ObjectOriented(input.scope);

    const className = input.scope.getName();
    const methodToken = node.findFirstExpression(Expressions.MethodName)!.getFirstToken();
    const methodName = methodToken?.getStr();

    const classDefinition = input.scope.findClassDefinition(className);
    if (classDefinition === undefined) {
      throw new Error("Class definition for \"" + className + "\" not found");
    }

    const {method: methodDefinition} = helper.searchMethodName(classDefinition, methodName);
    if (methodDefinition === undefined) {
      throw new Error("Method definition \"" + methodName + "\" not found");
    }

    const start = node.getFirstToken().getStart();
    if (methodDefinition.isStatic() === false) {
      input.scope.push(ScopeType.MethodInstance, methodName, start, input.filename);
      input.scope.addList(classDefinition.getAttributes().getInstance());
    }

    input.scope.push(ScopeType.Method, methodName, start, input.filename);

    input.scope.addReference(methodToken, methodDefinition, ReferenceType.MethodImplementationReference, input.filename);
    input.scope.addList(methodDefinition.getParameters().getAll());

    for (const i of helper.findInterfaces(classDefinition)) {
      if (methodName.toUpperCase().startsWith(i.name.toUpperCase() + "~") === false) {
        continue;
      }
      const idef = input.scope.findInterfaceDefinition(i.name);
      if (idef === undefined) {
        continue;
      }
      input.scope.addReference(methodToken, idef, ReferenceType.ObjectOrientedReference, input.filename);
    }
  }
}