import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineFS} from "../expressions/inline_fs";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {FSTarget} from "../expressions/fstarget";

export class InsertInternal {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const afterAssigning = node.findExpressionAfterToken("ASSIGNING");
    if (afterAssigning?.get() instanceof Expressions.FSTarget) {
      let source = node.findDirectExpression(Expressions.BasicSource);
      if (source === undefined) {
        source = node.findDirectExpression(Expressions.Source);
      }
      const sourceType = source ? new Source().runSyntax(source, scope, filename) : undefined;

      const inlinefs = afterAssigning?.findDirectExpression(Expressions.InlineFS);
      if (inlinefs) {
        new InlineFS().runSyntax(inlinefs, scope, filename, sourceType);
      } else {
        new FSTarget().runSyntax(afterAssigning, scope, filename, sourceType);
      }
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.SimpleSource)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      new Target().runSyntax(t, scope, filename);
    }

  }
}