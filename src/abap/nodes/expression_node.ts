import {CountableNode} from "./_countable_node";
import {Expression} from "../combi";
import {TokenNode} from "./token_node";
import {Token} from "../tokens/_token";
import {INode} from "./_inode";
import {Pragma} from "../tokens";

export class ExpressionNode extends CountableNode {
  private readonly expression: Expression;

  public constructor(expression: Expression) {
    super();
    this.expression = expression;
  }

  public get() {
    return this.expression;
  }

  public getFirstToken(): Token {
    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        return child.get();
      } else if (child instanceof ExpressionNode) {
        return child.getFirstToken();
      }
    }
    throw new Error("getFirstToken, unexpected type");
  }

  public concatTokens(): string {
    let str = "";
    let prev: Token | undefined;
    for (const token of this.getTokens()) {
      if (token instanceof Pragma) {
        continue;
      }
      if (str === "") {
        str = token.getStr();
      } else if (prev && prev.getStr().length + prev.getCol() === token.getCol()
          && prev.getRow() === token.getRow()) {
        str = str + token.getStr();
      } else {
        str = str + " " + token.getStr();
      }
      prev = token;
    }
    return str;
  }

  public getTokens(): Token[] {
    let tokens: Token[] = [];

    for (const c of this.getChildren()) {
      tokens = tokens.concat(this.toTokens(c));
    }

    return tokens;
  }

  private toTokens(b: INode): Token[] {
    let tokens: Token[] = [];

    if (b instanceof TokenNode) {
      tokens.push(b.get());
    }

    for (const c of b.getChildren()) {
      if (c instanceof TokenNode) {
        tokens.push(c.get());
      } else {
        tokens = tokens.concat(this.toTokens(c));
      }
    }

    return tokens;
  }
  public getLastToken(): Token {
    const child = this.getLastChild();

    if (child instanceof TokenNode) {
      return child.get();
    } else if (child instanceof ExpressionNode) {
      return child.getLastToken();
    }

    throw new Error("getLastToken, unexpected type");
  }

  public getAllTokens(): Token[] {
    let ret: Token[] = [];

    for (const child of this.getChildren()) {
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

  public findDirectExpression(type: new () => Expression): ExpressionNode | undefined {
    for (const child of this.getChildren()) {
      if (child instanceof ExpressionNode && child.get() instanceof type) {
        return child;
      }
    }
    return undefined;
  }

  public findDirectExpressions(type: new () => Expression): ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof ExpressionNode && child.get() instanceof type) {
        ret.push(child);
      }
    }
    return ret;
  }

  public findDirectTokenByText(text: string): Token | undefined {
    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        if (child.get().getStr().toUpperCase() === text.toUpperCase()) {
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
    for (const child of this.getChildren()) {
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

  public findFirstExpression(type: new () => Expression): ExpressionNode | undefined {
    if (this.get() instanceof type) {
      return this;
    }

    for (const child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as ExpressionNode;
      } else if (child instanceof TokenNode) {
        continue;
      } else if (child instanceof ExpressionNode) {
        const res = child.findFirstExpression(type);
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