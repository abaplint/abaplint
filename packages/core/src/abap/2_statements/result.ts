import {Token} from "../1_lexer/tokens/_token";
import {ExpressionNode} from "../nodes/expression_node";
import {TokenNode} from "../nodes/token_node";

export class Result {
  private readonly tokens: readonly Token[];
  private readonly tokenIndex: number;
  private nodes: (ExpressionNode | TokenNode)[] | undefined;

  public constructor(tokens: readonly Token[], tokenIndex: number, nodes?: (ExpressionNode | TokenNode)[]) {
// tokens: all tokens, from the tokenIndex = not yet matched
// nodes: matched tokens
    this.tokens = tokens;
    this.tokenIndex = tokenIndex;
    this.nodes = nodes;
    if (this.nodes === undefined) {
      this.nodes = [];
    }
  }

  public peek(): Token {
    return this.tokens[this.tokenIndex];
  }

  public shift(node: ExpressionNode | TokenNode): Result {
    if (this.nodes) {
      const cp = this.nodes.slice();
      if (node) {
        cp.push(node);
      }
      return new Result(this.tokens, this.tokenIndex + 1, cp);
    } else {
      throw new Error("shift, error");
    }
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

  public remainingLength(): number {
    return this.tokens.length - this.tokenIndex;
  }

}