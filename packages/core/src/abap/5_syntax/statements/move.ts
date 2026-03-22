import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {InlineData} from "../expressions/inline_data";
import {AbstractType} from "../../types/basic/_abstract_type";
import {StatementSyntax} from "../_statement_syntax";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {Dereference} from "../expressions/dereference";
import {IdentifierMeta} from "../../types/_typed_identifier";

export class Move implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const targets = node.findDirectExpressions(Expressions.Target);
    const firstTarget = targets[0];

    const inline = firstTarget?.findDirectExpression(Expressions.InlineData);

    let targetType: AbstractType | undefined = undefined;
    if (inline === undefined) {
      targetType = firstTarget ? Target.runSyntax(firstTarget, input) : undefined;
      for (const t of targets) {
        if (t === firstTarget) {
          continue;
        }
        Target.runSyntax(t, input);
      }
    }

    if (inline === undefined && firstTarget !== undefined) {
// hmm, does this do the scoping correctly? handle constants etc? todo
      const found = input.scope.findVariable(firstTarget.concatTokens());
      if (found && found.getMeta().includes(IdentifierMeta.ReadOnly)) {
        const message = `"${firstTarget.concatTokens()}" cannot be modified, it is readonly`;
        input.issues.push(syntaxIssue(input, firstTarget.getFirstToken(), message));
        return;
      }
    }

    const source = node.findDirectExpression(Expressions.Source);
    let sourceType = source ? Source.runSyntax(source, input, targetType) : undefined;
    if (sourceType === undefined) {
      const message = "No source type determined";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    if (node.findDirectExpression(Expressions.Dereference)) {
      sourceType = Dereference.runSyntax(node, sourceType, input);
    }

    if (inline) {
      InlineData.runSyntax(inline, input, sourceType);
      targetType = sourceType;
    }

    if (node.findDirectTokenByText("?=")) {
      if (new TypeUtils(input.scope).isCastable(sourceType, targetType) === false) {
        const message = "Incompatible types";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    } else if (new TypeUtils(input.scope).isAssignableNew(sourceType, targetType, source) === false) {
      const message = "Incompatible types";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

  }
}