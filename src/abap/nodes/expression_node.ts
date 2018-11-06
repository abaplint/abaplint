import {CountableNode} from "./_countable_node";
import {Expression} from "../combi";

export class ExpressionNode extends CountableNode {
  private expression: Expression;

  public constructor(expression: Expression) {
    super();
    this.expression = expression;
  }

  public get() {
    return this.expression;
  }
}