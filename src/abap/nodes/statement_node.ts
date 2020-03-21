import {AbstractNode} from "./_abstract_node";
import {IStatement} from "../2_statements/statements/_statement";
import {INode} from "./_inode";
import {Position} from "../../position";
import {Token} from "../1_lexer/tokens/_token";
import {Pragma} from "../1_lexer/tokens/pragma";
import {TokenNode} from "./token_node";
import {ExpressionNode} from "./expression_node";
import {Expression} from "../2_statements/combi";
import {String, StringTemplate, StringTemplateBegin, StringTemplateMiddle, StringTemplateEnd} from "../1_lexer/tokens/string";
import {Comment} from "../1_lexer/tokens/comment";

export class StatementNode extends AbstractNode {
  private readonly statement: IStatement;
  private readonly colon: Token | undefined;
  private readonly pragmas: Token[];

  public constructor(statement: IStatement, colon?: Token | undefined, pragmas?: Token[]) {
    super();
    this.statement = statement;
    this.colon = colon;

    if (pragmas) {
      this.pragmas = pragmas;
    } else {
      this.pragmas = [];
    }
  }

  public get() {
    return this.statement;
  }

  public getColon(): Token | undefined {
    return this.colon;
  }

  public getPragmas(): Token[] {
    return this.pragmas;
  }

  public setChildren(children: INode[]): StatementNode {
    if (children.length === 0) {
      throw "statement: zero children";
    }

    this.children = children;

    return this;
  }

  public getStart(): Position {
    return this.getTokens()[0].getStart();
  }

  public getEnd(): Position {
    const tokens = this.getTokens();
    const last = tokens[tokens.length - 1];

    const pos = new Position(last.getStart().getRow(),
                             last.getStart().getCol() + last.getStr().length);

    return pos;
  }

  public getTokens(): Token[] {
    let tokens: Token[] = [];

    for (const c of this.getChildren()) {
      tokens = tokens.concat(this.toTokens(c));
    }

    return tokens;
  }

  public getTokenNodes(): TokenNode[] {
    let tokens: TokenNode[] = [];

    for (const c of this.getChildren()) {
      tokens = tokens.concat(this.toTokenNodess(c));
    }

    return tokens;
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

  public getTerminator(): string {
    return this.getTokens()[this.getTokens().length - 1].getStr();
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

  public getLastToken(): Token {
    const child = this.getLastChild();

    if (child instanceof TokenNode) {
      return child.get();
    } else if (child instanceof ExpressionNode) {
      return child.getLastToken();
    }

    throw new Error("getLastToken, unexpected type");
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

  public findFirstExpression(type: new () => Expression): ExpressionNode | undefined {
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

  /**
   * Returns the Position of the first token if the sequence is found,
   * otherwise undefined. Strings and Comments are ignored in this search.
   * @param first Text of the first Token
   * @param second Text of the second Token
   */
  public findTokenSequencePosition(first: string, second: string): Position | undefined {
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
      if (prev && token.getStr().toUpperCase() === second && prev?.getStr().toUpperCase() === first.toUpperCase()) {
        return prev.getStart();
      } else {
        prev = token;
      }
    }
    return undefined;
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

  private toTokenNodess(b: INode): TokenNode[] {
    let tokens: TokenNode[] = [];

    if (b instanceof TokenNode) {
      tokens.push(b);
    }

    for (const c of b.getChildren()) {
      if (c instanceof TokenNode) {
        tokens.push(c);
      } else {
        tokens = tokens.concat(this.toTokenNodess(c));
      }
    }

    return tokens;
  }
}