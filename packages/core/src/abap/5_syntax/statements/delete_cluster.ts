import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class DeleteCluster implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
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