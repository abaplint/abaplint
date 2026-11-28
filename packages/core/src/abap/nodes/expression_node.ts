import {TokenNode} from "./token_node";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {Pragma, StringToken, StringTemplate, StringTemplateBegin, StringTemplateMiddle, StringTemplateEnd, Comment} from "../1_lexer/tokens";
import {IStatementRunnable} from "../2_statements/statement_runnable";
import {AbstractNode} from "./_abstract_node";
import {walkCountTokens, walkFindAll, walkFindAllMulti, walkFindFirst, walkFirstToken, walkLastToken, walkTokens} from "./_walk";

export class ExpressionNode extends AbstractNode<ExpressionNode | TokenNode> {
  private readonly expression: IStatementRunnable;

  public constructor(expression: IStatementRunnable) {
    super();
    this.expression = expression;
  }

  public addChild(_n: ExpressionNode | TokenNode): void {
    throw new Error("ExpressionNode: addChild() must not be called, nodes are immutable after setChildren()");
  }

  public get(): IStatementRunnable {
    return this.expression;
  }

  public setChildren(children: (ExpressionNode | TokenNode)[]): ExpressionNode {
    super.setChildren(children);
    return this;
  }

  // not stored on the node, saves a field per ExpressionNode, the statement parser tracks counts itself
  public countTokens(): number {
    return walkCountTokens(this.getChildren());
  }

  public getFirstToken(): AbstractToken {
    return walkFirstToken(this, "ExpressionNode, getFirstToken, no children");
  }

  public concatTokensWithLinebreaks(): string {
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
        if (prev && prev.getRow() !== token.getRow()) {
          str = str + "\n" + token.getStr();
        } else {
          str = str + " " + token.getStr();
        }
      }
      prev = token;
    }
    return str;
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

  // todo: delete this method?, its slow
  public getTokens(): readonly AbstractToken[] {
    return walkTokens(this.getChildren());
  }


  public getLastToken(): AbstractToken {
    return walkLastToken(this, "ExpressionNode, getLastToken, no children");
  }

  public getAllTokens(): AbstractToken[] {
    return walkTokens(this.getChildren());
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
    return walkFindAll(this.getChildren(), type, true);
  }

  public findAllExpressions(type: new () => IStatementRunnable): readonly ExpressionNode[] {
    return walkFindAll(this.getChildren(), type, false);
  }

  public findAllExpressionsMulti(type: (new () => IStatementRunnable)[], recursive = false): ExpressionNode[] {
    return walkFindAllMulti(this.getChildren(), type, recursive);
  }

  public findFirstExpression(type: new () => IStatementRunnable): ExpressionNode | undefined {
    if (this.get() instanceof type) {
      return this;
    }
    return walkFindFirst(this.getChildren(), type);
  }
}
