import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {ComponentCompare} from "../expressions/component_compare";
import {ComponentCond} from "../expressions/component_cond";
import {StatementSyntax} from "../_statement_syntax";
import {ILookupResult} from "../../../ddic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {TableType} from "../../types/basic";
import {SyntaxInput} from "../_syntax_input";

export class DeleteInternal implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    let targetType: AbstractType | undefined = undefined;
    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      let tabl: ILookupResult | undefined = undefined;
      if (node.getChildren().length === 5 && node.getChildren()[2].concatTokens().toUpperCase() === "FROM") {
        // it might be a database table
        tabl = input.scope.getDDIC()?.lookupTableOrView(target.concatTokens());
        if (tabl) {
          input.scope.getDDICReferences().addUsing(input.scope.getParentObj(), {object: tabl.object});
        }
      }
      if (tabl === undefined) {
        targetType = Target.runSyntax(target, input);
        if (targetType instanceof TableType) {
          targetType = targetType.getRowType();
        }
      }
    }

    for (const t of node.findDirectExpressions(Expressions.ComponentCompare)) {
      ComponentCompare.runSyntax(t, input, targetType);
    }

    for (const t of node.findDirectExpressions(Expressions.ComponentCond)) {
      ComponentCond.runSyntax(t, input, targetType);
    }

  }
}