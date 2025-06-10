import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {InlineData} from "../expressions/inline_data";
import {AbstractType} from "../../types/basic/_abstract_type";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class WhenType implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const nameToken = node.findFirstExpression(Expressions.ClassName)?.getFirstToken();
    if (nameToken === undefined) {
      return undefined;
    }

    let type: AbstractType | undefined = undefined;
    const className = nameToken.getStr();
    const found = input.scope.findObjectDefinition(className);
    if (found === undefined && input.scope.getDDIC().inErrorNamespace(className) === false) {
      type = VoidType.get(className);
    } else if (found === undefined) {
      const message = "Class " + className + " not found";
      input.issues.push(syntaxIssue(input, nameToken, message));
      return;
    } else {
      type = new ObjectReferenceType(found);
    }

    const target = node?.findDirectExpression(Expressions.Target);
    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, input, type);
    } else if (target) {
      new Target().runSyntax(target, input);
    }
  }
}