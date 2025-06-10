import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {SyntaxInput} from "../_syntax_input";
import {Compare} from "./compare";

export class Cond {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): void {
    for (const t of node.findDirectExpressions(Expressions.CondSub)) {
      const c = t.findDirectExpression(Expressions.Cond);
      if (c) {
        Cond.runSyntax(c, input);
      }
    }

    for (const t of node.findDirectExpressions(Expressions.Compare)) {
      Compare.runSyntax(t, input);
    }

  }
}