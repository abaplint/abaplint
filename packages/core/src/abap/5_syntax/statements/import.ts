import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Import implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      const children = node.getChildren();
      const index = children.indexOf(s);
      const write = children[index - 1]?.concatTokens().toUpperCase() === "INTO";
      Source.runSyntax(s, input, undefined, write, false, !write);
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      Target.runSyntax(t, input);
    }

    const databaseName = node.findExpressionAfterToken("DATABASE");
    if (databaseName) {
      const found = input.scope.getDDIC()?.lookupTableOrView(databaseName.concatTokens());
      if (found) {
        input.scope.getDDICReferences().addUsing(input.scope.getParentObj(), {object: found.object});
      }
    }

  }
}
