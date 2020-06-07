import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {UnknownType} from "../../types/basic/unknown_type";

export class Target {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, _filename: string): AbstractType | undefined {

    const children = node.getChildren().slice();
    const first = children.shift();
    if (first === undefined || !(first instanceof ExpressionNode)) {
      return undefined;
    }

    if (first.get() instanceof Expressions.TargetField) {
      return scope.findVariable(first.getFirstToken().getStr())?.getType();
    }

    return new UnknownType("todo, target type");
  }
}