import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {InlineData} from "../expressions/inline_data";
import {AbstractType} from "../../types/basic/_abstract_type";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {ReferenceType} from "../_reference";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class WhenType implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const nameToken = node.findFirstExpression(Expressions.ClassName)?.getFirstToken();
    if (nameToken === undefined) {
      return undefined;
    }

    let type: AbstractType | undefined = undefined;
    const className = nameToken.getStr().toUpperCase();
    const found = input.scope.existsObject(className);
    if (found?.id) {
      type = new ObjectReferenceType(found.id);
      input.scope.addReference(nameToken, found.id, ReferenceType.ObjectOrientedReference, input.filename);
    } else if (input.scope.getDDIC().inErrorNamespace(className) === false) {
      type = VoidType.get(className);
      input.scope.addReference(nameToken, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename, {ooName: className, ooType: "Void"});
    } else {
      const message = "Class " + className + " not found";
      input.issues.push(syntaxIssue(input, nameToken, message));
      return;
    }

    const target = node?.findDirectExpression(Expressions.Target);
    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      InlineData.runSyntax(inline, input, type);
    } else if (target) {
      Target.runSyntax(target, input);
    }
  }
}