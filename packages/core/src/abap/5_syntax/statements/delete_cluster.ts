import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";

export class DeleteCluster implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    const databaseName = node.findExpressionAfterToken("DATABASE");
    if (databaseName) {
      const found = scope.getDDIC()?.lookupTableOrView(databaseName.concatTokens());
      if (found) {
        scope.getDDICReferences().addUsing(scope.getParentObj(), found.object);
      }
    }

  }
}