import * as Expressions from "../2_statements/expressions";
import {ExpressionNode, TokenNode} from "../nodes";

/** The number of NOT in front of a relational expression or a parenthesized condition, "NOT NOT a = 1" gives 2 */
export function countLeadingNot(node: ExpressionNode): number {
  const children = node.getChildren();
  let count = 0;
  while (count < children.length
      && children[count] instanceof TokenNode
      && children[count].getFirstToken().getStr().toUpperCase() === "NOT") {
    count++;
  }
  return count;
}

/** True if a conjunct of the WHERE condition reachable through AND only, ie. not under OR or an odd number of NOT,
 *  compares the key component with = or IS INITIAL. Without such a comparison of its first component,
 *  a sorted key cannot be used to optimize the WHERE condition */
export function hasKeyCompare(cond: ExpressionNode, component: string): boolean {
  if (cond.findDirectTokenByText("OR") !== undefined) {
    return false;
  }
  for (const child of cond.getChildren()) {
    if (!(child instanceof ExpressionNode) || countLeadingNot(child) % 2 === 1) {
      continue;
    }
    if (child.get() instanceof Expressions.ComponentCompare) {
      const concat = child.getChildren().slice(countLeadingNot(child))
        .map(c => c.concatTokens()).join(" ").toUpperCase().replace(/\s+/g, " ");
      if (concat.startsWith(component + " = ")
          || concat.startsWith(component + " EQ ")
          || concat === component + " IS INITIAL") {
        return true;
      }
    } else if (child.get() instanceof Expressions.ComponentCondSub) {
      const sub = child.findDirectExpression(Expressions.ComponentCond);
      if (sub !== undefined && hasKeyCompare(sub, component)) {
        return true;
      }
    }
  }
  return false;
}
