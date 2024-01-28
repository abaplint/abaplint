import {TokenNode} from "./token_node";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {INode} from "./_inode";
import {Pragma, StringToken, StringTemplate, StringTemplateBegin, StringTemplateMiddle, StringTemplateEnd, Comment} from "../1_lexer/tokens";
import {IStatementRunnable} from "../2_statements/statement_runnable";
import {AbstractNode} from "./_abstract_node";

export class ExpressionNode extends AbstractNode<ExpressionNode | TokenNode> {
  private readonly expression: IStatementRunnable;

  public constructor(expression: IStatementRunnable) {
    super();
    this.expression = expression;
  }

  public get(): IStatementRunnable {
    return this.expression;
  }

  public countTokens(): number {
    let ret = 0;
    for (const c of this.getChildren()) {
      ret = ret + c.countTokens();
    }
    return ret;
  }

  public getFirstToken(): AbstractToken {
    for (const child of this.getChildren()) {
      return child.getFirstToken();
    }
    throw new Error("ExpressionNode, getFirstToken, no children");
  }

  public concatTokens(): string {
    let str = "";
    let prev: AbstractToken | undefined;
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
    let prev: AbstractToken | undefined;
    for (const token of this.getTokens()) {
      if (token instanceof Comment
          || token instanceof StringToken
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

  public getTokens(): readonly AbstractToken[] {
    const tokens: AbstractToken[] = [];

    for (const c of this.getChildren()) {
      tokens.push(...this.toTokens(c));
    }

    return tokens;
  }

  private toTokens(b: INode): readonly AbstractToken[] {
    const tokens: AbstractToken[] = [];

    if (b instanceof TokenNode) {
      tokens.push(b.get());
      return tokens;
    }

    for (const c of b.getChildren()) {
      if (c instanceof TokenNode) {
        tokens.push(c.get());
      } else {
        tokens.push(...this.toTokens(c));
      }
    }

    return tokens;
  }

  public getLastToken(): AbstractToken {
    const child = this.getLastChild();

    if (child) {
      return child.getLastToken();
    }

    throw new Error("ExpressionNode, getLastToken, no children");
  }

  public getAllTokens(): AbstractToken[] {
    const ret: AbstractToken[] = [];

    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        ret.push(child.get());
      } else {
        ret.push(...child.getAllTokens());
      }
    }

    return ret;
  }

  public getDirectTokens(): readonly AbstractToken[] {
    const ret: AbstractToken[] = [];

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

  public findExpressionAfterToken(text: string): ExpressionNode | undefined {
    const children = this.getChildren();

    for (let i = 0; i < children.length - 1; i++) {
      const c = children[i];
      const next = children[i + 1];
      if (c instanceof TokenNode
          && c.get().getStr().toUpperCase() === text.toUpperCase()
          && next instanceof ExpressionNode) {
        return next;
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

  public findDirectExpressionsMulti(type: (new () => IStatementRunnable)[]): ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof ExpressionNode) {
        for (const t of type) {
          if (child.get() instanceof t) {
            ret.push(child);
            break;
          }
        }
      }
    }
    return ret;
  }

  public findDirectTokenByText(text: string): AbstractToken | undefined {
    const search = text.toUpperCase();
    for (const child of this.getChildren()) {
      if (child instanceof TokenNode && child.get().getStr().toUpperCase() === search) {
        return child.get();
      }
    }
    return undefined;
  }

  public findAllExpressionsRecursive(type: new () => IStatementRunnable): readonly ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        continue;
      } else if (child.get() instanceof type) {
        ret.push(child);
      }
      ret.push(...child.findAllExpressionsRecursive(type));
    }
    return ret;
  }

  public findAllExpressions(type: new () => IStatementRunnable): readonly ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        continue;
      } else if (child.get() instanceof type) {
        ret.push(child);
      } else {
        ret.push(...child.findAllExpressions(type));
      }
    }
    return ret;
  }

  public findAllExpressionsMulti(type: (new () => IStatementRunnable)[], recursive = false): ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        continue;
      }
      const before = ret.length;
      for (const t of type) {
        if (child.get() instanceof t) {
          ret.push(child);
        }
      }
      if (before === ret.length || recursive === true) {
        ret.push(...child.findAllExpressionsMulti(type, recursive));
      }
    }
    return ret;
  }

  public findFirstExpression(type: new () => IStatementRunnable): ExpressionNode | undefined {
    if (this.get() instanceof type) {
      return this;
    }

    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        continue;
      } else if (child.get() instanceof type) {
        return child;
      } else {
        const res = child.findFirstExpression(type);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }
}