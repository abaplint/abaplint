import {StatementNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {ObjectOriented} from "../_object_oriented";
import {ScopeType} from "../_scope_type";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {Visibility} from "../../4_file_information/visibility";

export class MethodImplementation implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const helper = new ObjectOriented(input.scope);

    const className = input.scope.getName();
    const methodToken = node.findFirstExpression(Expressions.MethodName)!.getFirstToken();
    const methodName = methodToken?.getStr();

    const classDefinition = input.scope.findClassDefinition(className);
    if (classDefinition === undefined) {
      const message = "Class definition for \"" + className + "\" not found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const {method: methodDefinition} = helper.searchMethodName(classDefinition, methodName);

    if (classDefinition.isForTesting()
        && methodDefinition?.getVisibility() !== Visibility.Private
        && ["SETUP", "TEARDOWN", "CLASS_SETUP", "CLASS_TEARDOWN"].includes(methodName.toUpperCase())) {
      const message = "Special test method \"" + methodName + "\" must be private";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const start = node.getFirstToken().getStart();
    if (methodDefinition?.isStatic() === false) {
      input.scope.push(ScopeType.MethodInstance, methodName, start, input.filename);
      input.scope.addList(classDefinition.getAttributes().getInstance());
    }

    input.scope.push(ScopeType.Method, methodName, start, input.filename);

    // note: the scope must be pushed before returning
    if (methodDefinition === undefined) {
      const message = "Method definition \"" + methodName + "\" not found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

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