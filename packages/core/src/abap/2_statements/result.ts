import {Token as Tokens_Token} from "../1_lexer/tokens/_token";
import {ExpressionNode} from "../nodes/expression_node";
import {TokenNode} from "../nodes/token_node";

export class Result {
  private readonly tokens: readonly Tokens_Token[];
  private nodes: (ExpressionNode | TokenNode)[] | undefined;

  public constructor(a: readonly Tokens_Token[], n?: (ExpressionNode | TokenNode)[]) {
// tokens: not yet matched
// nodes: matched tokens
    this.tokens = a;
    this.nodes = n;
    if (this.nodes === undefined) {
      this.nodes = [];
    }
  }

  public peek(): Tokens_Token {
    return this.tokens[0];
  }

  public shift(node: ExpressionNode | TokenNode): Result {
    const copy = this.tokens.slice();
    copy.shift();
    if (this.nodes) {
      const cp = this.nodes.slice();
      if (node) {
        cp.push(node);
      }
      return new Result(copy, cp);
    } else {
      throw new Error("shift, error");
    }
  }

  public getTokens(): readonly Tokens_Token[] {
    return this.tokens;
  }

  public popNode(): ExpressionNode | TokenNode | undefined {
    if (!this.nodes) {
      throw new Error("popNode, error");
    }
    return this.nodes.pop();
  }

  public getNodes(): (ExpressionNode | TokenNode)[] {
    if (!this.nodes) {
      throw new Error("getNodes, error");
    }
    return this.nodes;
  }

  public setNodes(n: (ExpressionNode | TokenNode)[]): void {
    this.nodes = n;
  }

  public length(): number {
    return this.tokens.length;
  }

  public toStr(): string {
    let ret = "";
    for (const token of this.tokens) {
      ret = ret + " " + token.getStr();
    }
    return ret;
  }
}