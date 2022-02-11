import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {Let} from "./let";

export class ConvBody {
  public runSyntax(node: ExpressionNode | undefined, scope: CurrentScope, filename: string) {
    if (node === undefined) {
      return;
    }

    let scoped = false;
    const l = node.findDirectExpression(Expressions.Let);
    if (l) {
      scoped = new Let().runSyntax(l, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    if (scoped === true) {
      scope.pop(node.getLastToken().getEnd());
    }
  }
}