import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";

export class MessageSource {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string) {
    for (const f of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(f, scope, filename);
    }
  }
}