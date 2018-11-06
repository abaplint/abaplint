import {CountableNode} from "./_countable_node";
import {Expression} from "../combi";
import {TokenNode} from "./token_node";

export class ExpressionNode extends CountableNode {
  private expression: Expression;

  public constructor(expression: Expression) {
    super();
    this.expression = expression;
  }

  public get() {
    return this.expression;
  }

  public getFirstToken(): TokenNode {
    for (let child of this.getChildren()) {
      if (child instanceof TokenNode) {
        return child;
      } else if (child instanceof ExpressionNode) {
        return child.getFirstToken();
      } else {
        throw new Error("getFirstToken, unexpected type");
      }
    }
    return undefined;
  }

  public findAllExpressions(type: any): ExpressionNode[] {
    let ret: ExpressionNode[] = [];
    for (let child of this.getChildren()) {
      if (child.get() instanceof type) {
        ret.push(child as ExpressionNode);
      } else if (child instanceof TokenNode) {
        continue;
      } else if (child instanceof ExpressionNode) {
        ret = ret.concat(child.findAllExpressions(type));
      } else {
        throw new Error("findAllExpressions, unexpected type");
      }
    }
    return ret;
  }

  public findFirstExpression(type: any): ExpressionNode {
    for (let child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as ExpressionNode;
      } else if (child instanceof TokenNode) {
        continue;
      } else if (child instanceof ExpressionNode) {
        let res = child.findFirstExpression(type);
        if (res) {
          return res;
        }
      } else {
        throw new Error("findFirstExpression, unexpected type");
      }
    }
    return undefined;
  }
}