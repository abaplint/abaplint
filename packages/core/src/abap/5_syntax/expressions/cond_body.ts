import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {Let} from "./let";
import {Cond} from "./cond";
import {AbstractType} from "../../types/basic/_abstract_type";

export class CondBody {
  public runSyntax(
    node: ExpressionNode | undefined,
    scope: CurrentScope,
    filename: string): AbstractType | undefined {

    if (node === undefined) {
      return undefined;
    }

    let scoped = false;
    const l = node.findDirectExpression(Expressions.Let);
    if (l) {
      scoped = new Let().runSyntax(l, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Cond)) {
      new Cond().runSyntax(s, scope, filename);
    }

    let type: AbstractType | undefined = undefined;
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (type === undefined) {
        type = new Source().runSyntax(s, scope, filename);
      } else {
        new Source().runSyntax(s, scope, filename);
      }
    }

    if (scoped === true) {
      scope.pop(node.getLastToken().getEnd());
    }

    return type;
  }
}