import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ComponentCompare} from "./component_compare";

export class ComponentCond {

  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): void {

    for (const t of node.findDirectExpressions(Expressions.ComponentCondSub)) {
      const c = t.findDirectExpression(Expressions.ComponentCond);
      if (c) {
        new ComponentCond().runSyntax(c, scope, filename);
      }
    }

    for (const t of node.findDirectExpressions(Expressions.ComponentCompare)) {
      new ComponentCompare().runSyntax(t, scope, filename);
    }

  }

}