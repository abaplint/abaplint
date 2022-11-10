import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {ComponentCompare} from "../expressions/component_compare";
import {ComponentCond} from "../expressions/component_cond";
import {StatementSyntax} from "../_statement_syntax";
import {ILookupResult} from "../../../ddic";

export class DeleteInternal implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      let tabl: ILookupResult | undefined = undefined;
      if (node.getChildren().length === 5 && node.getChildren()[2].concatTokens().toUpperCase() === "FROM") {
        // it might be a database table
        tabl = scope.getDDIC()?.lookupTableOrView(target.concatTokens());
        if (tabl) {
          scope.getDDICReferences().addUsing(scope.getParentObj(), {object: tabl.object});
        }
      }
      if (tabl === undefined) {
        new Target().runSyntax(target, scope, filename);
      }
    }

    for (const t of node.findDirectExpressions(Expressions.ComponentCompare)) {
      new ComponentCompare().runSyntax(t, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.ComponentCond)) {
      new ComponentCond().runSyntax(t, scope, filename);
    }

  }
}