import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";

export class Export implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      new Target().runSyntax(t, scope, filename);
    }

    const databaseName = node.findExpressionAfterToken("DATABASE");
    if (databaseName) {
      const found = scope.getDDIC()?.lookupTableOrView(databaseName.concatTokens());
      if (found) {
        scope.getDDICReferences().addUsing(scope.getParentObj(), {object: found.object});
      }
    }

  }
}