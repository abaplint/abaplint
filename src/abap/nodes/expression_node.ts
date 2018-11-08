import {CountableNode} from "./_countable_node";
import {Expression} from "../combi";
import {TokenNode} from "./token_node";
import {Token} from "../tokens/_token";

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
      }
    }
    throw new Error("getFirstToken, unexpected type");
  }

  public getAllTokens(): Token[] {
    let ret: Token[] = [];

    for (let child of this.getChildren()) {
      if (child instanceof TokenNode) {
        ret.push(child.get());
      } else if (child instanceof ExpressionNode) {
        ret = ret.concat(child.getAllTokens());
      } else {
        throw new Error("getAllTokens, unexpected type");
      }
    }

    return ret;
  }

  public findDirectTokenByText(text: string): Token {
    for (let child of this.getChildren()) {
      if (child instanceof TokenNode) {
        if (child.get().getStr() === text) {
          return child.get();
        }
      } else if (child instanceof ExpressionNode) {
        continue;
      } else {
        throw new Error("findDirectTokenByText, unexpected type");
      }
    }
    return undefined;
  }

  public findAllExpressions(type: new () => Expression): ExpressionNode[] {
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

  public findFirstExpression(type: new () => Expression): ExpressionNode {
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