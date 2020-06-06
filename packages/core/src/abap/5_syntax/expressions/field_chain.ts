import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";

export class FieldChain {
  public runSyntax(node: ExpressionNode, scope: CurrentScope): AbstractType {
    const name = node.concatTokens();

    const found = scope.findVariable(name);
    if (found) {
      return found.getType();
    }

    throw new Error("FieldChain, \"" + name + "\" variable not found");
  }
}