import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {ExpressionNode} from "../nodes/expression_node";
import {TokenNode} from "../nodes/token_node";

export class Result {
  private readonly tokens: readonly AbstractToken[];
  private readonly tokenIndex: number;
  private nodes: (ExpressionNode | TokenNode)[] | undefined;

  public constructor(tokens: readonly AbstractToken[], tokenIndex: number, nodes?: (ExpressionNode | TokenNode)[]) {
// tokens: all tokens, from the tokenIndex = not yet matched
// nodes: matched tokens
    this.tokens = tokens;
    this.tokenIndex = tokenIndex;
    this.nodes = nodes;
    if (this.nodes === undefined) {
      this.nodes = [];
    }
  }

  public peek(): AbstractToken {
    return this.tokens[this.tokenIndex];
  }

  public shift(node: ExpressionNode | TokenNode): Result {
    const cp = this.nodes!.slice();
    cp.push(node);
    return new Result(this.tokens, this.tokenIndex + 1, cp);
  }

  public popNode(): ExpressionNode | TokenNode | undefined {
    return this.nodes!.pop();
  }

  public getNodes(): (ExpressionNode | TokenNode)[] {
    return this.nodes!;
  }

  public setNodes(n: (ExpressionNode | TokenNode)[]): void {
    this.nodes = n;
  }

  public remainingLength(): number {
    return this.tokens.length - this.tokenIndex;
  }

}