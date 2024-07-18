import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {InlineData} from "../expressions/inline_data";
import {AbstractType} from "../../types/basic/_abstract_type";
import {StatementSyntax} from "../_statement_syntax";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Move implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const targets = node.findDirectExpressions(Expressions.Target);
    const firstTarget = targets[0];

    const inline = firstTarget?.findDirectExpression(Expressions.InlineData);

    let targetType: AbstractType | undefined = undefined;
    if (inline === undefined) {
      targetType = firstTarget ? new Target().runSyntax(firstTarget, input) : undefined;
      for (const t of targets) {
        if (t === firstTarget) {
          continue;
        }
        new Target().runSyntax(t, input);
      }
    }

    const source = node.findDirectExpression(Expressions.Source);
    const sourceType = source ? new Source().runSyntax(source, input, targetType) : undefined;
    if (sourceType === undefined) {
      const message = "No source type determined";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    if (inline) {
      new InlineData().runSyntax(inline, input, sourceType);
      targetType = sourceType;
    }

    if (node.findDirectTokenByText("?=")) {
      if (new TypeUtils(input.scope).isCastable(sourceType, targetType) === false) {
        const message = "Incompatible types";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    } else if (new TypeUtils(input.scope).isAssignable(sourceType, targetType) === false) {
      const message = "Incompatible types";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }
  }
}