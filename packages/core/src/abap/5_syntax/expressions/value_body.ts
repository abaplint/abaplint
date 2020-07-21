import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {For} from "./for";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";

export class ValueBody {
  public runSyntax(node: ExpressionNode | undefined, scope: CurrentScope, filename: string): AbstractType | undefined {
    if (node === undefined) {
      return;
    }

    const forNode = node.findDirectExpression(Expressions.For);
    if (forNode) {
      new For().runSyntax(forNode, scope, filename);
    }

    let type: AbstractType | undefined = undefined; // todo, this is only correct if there is a single source in the body
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      type = new Source().runSyntax(s, scope, filename);
    }

    return type;
  }
}