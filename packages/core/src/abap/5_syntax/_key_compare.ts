import * as Expressions from "../2_statements/expressions";
import {ExpressionNode} from "../nodes";

/** True if a conjunct of the WHERE condition reachable through AND only, ie. not under OR or NOT,
 *  compares the key component with = or IS INITIAL. Without such a comparison of its first component,
 *  a sorted key cannot be used to optimize the WHERE condition */
export function hasKeyCompare(cond: ExpressionNode, component: string): boolean {
  if (cond.findDirectTokenByText("OR") !== undefined) {
    return false;
  }
  for (const child of cond.getChildren()) {
    if (child.get() instanceof Expressions.ComponentCompare && child instanceof ExpressionNode) {
      const concat = child.concatTokens().toUpperCase().replace(/\s+/g, " ");
      if (concat.startsWith(component + " = ")
          || concat.startsWith(component + " EQ ")
          || concat === component + " IS INITIAL") {
        return true;
      }
    } else if (child.get() instanceof Expressions.ComponentCondSub
        && child instanceof ExpressionNode
        && child.findDirectTokenByText("NOT") === undefined) {
      const sub = child.findDirectExpression(Expressions.ComponentCond);
      if (sub !== undefined && hasKeyCompare(sub, component)) {
        return true;
      }
    }
  }
  return false;
}
