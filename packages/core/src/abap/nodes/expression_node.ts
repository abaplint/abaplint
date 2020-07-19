import {TokenNode} from "./token_node";
import {Token} from "../1_lexer/tokens/_token";
import {INode} from "./_inode";
import {Pragma, String, StringTemplate, StringTemplateBegin, StringTemplateMiddle, StringTemplateEnd, Comment} from "../1_lexer/tokens";
import {IStatementRunnable} from "../2_statements/statement_runnable";
import {AbstractNode} from "./_abstract_node";

export class ExpressionNode extends AbstractNode {
  private readonly expression: IStatementRunnable;

  public constructor(expression: IStatementRunnable) {
    super();
    this.expression = expression;
  }

  public get(): IStatementRunnable {
    return this.expression;
  }

  public countTokens(): number {
    // todo
    // @ts-ignore
    const count = this.getChildren().reduce((a, b) => { return a + b.countTokens(); }, 0);
    return count;
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

  public concatTokensWithoutStringsAndComments(): string {
    let str = "";
    let prev: Token | undefined;
    for (const token of this.getTokens()) {
      if (token instanceof Comment
          || token instanceof String
          || token instanceof StringTemplate
          || token instanceof StringTemplateBegin
          || token instanceof StringTemplateMiddle
          || token instanceof StringTemplateEnd) {
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

  public getTokens(): readonly Token[] {
    let tokens: Token[] = [];

    for (const c of this.getChildren()) {
      tokens = tokens.concat(this.toTokens(c));
    }

    return tokens;
  }

  private toTokens(b: INode): readonly Token[] {
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

  public getDirectTokens(): readonly Token[] {
    const ret: Token[] = [];

    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        ret.push(child.get());
      }
    }

    return ret;
  }

  public findDirectExpression(type: new () => IStatementRunnable): ExpressionNode | undefined {
    for (const child of this.getChildren()) {
      if (child instanceof ExpressionNode && child.get() instanceof type) {
        return child;
      }
    }
    return undefined;
  }

  public findDirectExpressions(type: new () => IStatementRunnable): readonly ExpressionNode[] {
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

  public findAllExpressions(type: new () => IStatementRunnable): readonly ExpressionNode[] {
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

  public findFirstExpression(type: new () => IStatementRunnable): ExpressionNode | undefined {
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