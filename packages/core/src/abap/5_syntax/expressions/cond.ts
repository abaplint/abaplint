import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Compare} from "./compare";

export class Cond {
  public runSyntax(node: ExpressionNode | undefined, scope: CurrentScope, filename: string): void {
    if (node === undefined) {
      throw new Error("Cond, expected node input");
    }

    for (const t of node.findDirectExpressions(Expressions.Cond)) {
      new Cond().runSyntax(t, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.Compare)) {
      new Compare().runSyntax(t, scope, filename);
    }

  }
}