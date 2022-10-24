import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {Target} from "./target";

export class ReduceNext {
  public runSyntax(node: ExpressionNode | undefined, scope: CurrentScope, filename: string): void {
    if (node === undefined) {
      return;
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.SimpleTarget)) {
      new Target().runSyntax(s, scope, filename);
    }
  }
}