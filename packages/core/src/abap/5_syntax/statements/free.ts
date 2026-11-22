import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Free implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      const inline = t.findDirectExpression(Expressions.InlineData) ?? t.findDirectExpression(Expressions.InlineFS);
      if (inline) {
        const message = `Inline declaration "${inline.concatTokens()}" not possible in FREE`;
        input.issues.push(syntaxIssue(input, inline.getFirstToken(), message));
        return;
      }
      Target.runSyntax(t, input);
    }

  }
}