import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Compare} from "./compare";

export class Cond {
  public runSyntax(node: ExpressionNode | undefined, scope: CurrentScope, filename: string): void {
    if (node === undefined) {
      throw new Error("Cond, expected node input");
    }

    for (const t of node.findDirectExpressions(Expressions.CondSub)) {
      const c = t.findDirectExpression(Expressions.Cond);
      if (c) {
        new Cond().runSyntax(c, scope, filename);
      }
    }

    for (const t of node.findDirectExpressions(Expressions.Compare)) {
      new Compare().runSyntax(t, scope, filename);
    }

  }
}