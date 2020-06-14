import {ExpressionNode, TokenNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {MethodCallChain} from "./method_call_chain";
import {UnknownType} from "../../types/basic/unknown_type";
import {FieldChain} from "./field_chain";

export class Source {
  public runSyntax(
    node: ExpressionNode,
    scope: CurrentScope,
    filename: string,
    targetType?: AbstractType): AbstractType | undefined {

    const children = node.getChildren().slice();
    const first = children.shift();

    if (first instanceof TokenNode) {
      const tok = first.getFirstToken().getStr();
      return new UnknownType("todo, Source type " + tok);
    } else if (first === undefined || !(first instanceof ExpressionNode)) {
      return undefined;
    }

    if (first.get() instanceof Expressions.MethodCallChain) {
      return new MethodCallChain().runSyntax(first, scope, filename, targetType);
    } else if (first.get() instanceof Expressions.FieldChain) {
      return new FieldChain().runSyntax(first, scope);
    }

    return new UnknownType("todo, Source type");
  }
}