import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";

export class RaiseWith {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string) {
    for (const f of node.findDirectExpressions(Expressions.SimpleSource2)) {
      new Source().runSyntax(f, scope, filename);
    }
  }
}