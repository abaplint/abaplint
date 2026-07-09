import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {ExpressionNode} from "../nodes/expression_node";
import {TokenNode} from "../nodes/token_node";

type ResultNode = {
  readonly node: ExpressionNode | TokenNode,
  readonly previous: ResultNode | undefined,
};

export class Result {
  private readonly tokens: readonly AbstractToken[];
  private readonly tokenIndex: number;
  private nodes: ResultNode | undefined;
  private nodeCount: number;

  public constructor(tokens: readonly AbstractToken[], tokenIndex: number, nodes?: (ExpressionNode | TokenNode)[]) {
// tokens: all tokens, from the tokenIndex = not yet matched
// nodes: matched tokens
    this.tokens = tokens;
    this.tokenIndex = tokenIndex;
    this.nodeCount = 0;

    if (nodes !== undefined) {
      this.setNodes(nodes);
    }
  }

  private static fromChain(tokens: readonly AbstractToken[], tokenIndex: number, nodes: ResultNode | undefined, nodeCount: number): Result {
    const ret = new Result(tokens, tokenIndex);
    ret.nodes = nodes;
    ret.nodeCount = nodeCount;
    return ret;
  }

  public peek(): AbstractToken {
    return this.tokens[this.tokenIndex];
  }

  public peekAt(offset: number): AbstractToken | undefined {
    return this.tokens[this.tokenIndex + offset];
  }

  public shift(node: ExpressionNode | TokenNode): Result {
    return Result.fromChain(this.tokens, this.tokenIndex + 1, {node, previous: this.nodes}, this.nodeCount + 1);
  }

  public wrapConsumed(consumedTokens: number, node: ExpressionNode): Result {
    let current = this.nodes;
    let currentCount = this.nodeCount;
    const children: (ExpressionNode | TokenNode)[] = [];
    while (consumedTokens > 0) {
      if (current === undefined) {
        break;
      }
      children.push(current.node);
      consumedTokens = consumedTokens - current.node.countTokens();
      current = current.previous;
      currentCount--;
    }

    node.setChildren(children.reverse());
    this.nodes = {node, previous: current};
    this.nodeCount = currentCount + 1;
    return this;
  }

  public popNode(): ExpressionNode | TokenNode | undefined {
    if (this.nodes === undefined) {
      return undefined;
    }
    const ret = this.nodes.node;
    this.nodes = this.nodes.previous;
    this.nodeCount--;
    return ret;
  }

  public getNodes(): (ExpressionNode | TokenNode)[] {
    const ret = new Array<ExpressionNode | TokenNode>(this.nodeCount);
    let current = this.nodes;

    for (let index = this.nodeCount - 1; index >= 0; index--) {
      if (current === undefined) {
        break;
      }
      ret[index] = current.node;
      current = current.previous;
    }

    return ret;
  }

  public setNodes(n: (ExpressionNode | TokenNode)[]): void {
    this.nodes = undefined;
    this.nodeCount = 0;
    for (const node of n) {
      this.nodes = {node, previous: this.nodes};
      this.nodeCount++;
    }
  }

  public getTokens(): readonly AbstractToken[] {
    return this.tokens;
  }

  public getTokenIndex(): number {
    return this.tokenIndex;
  }

  public remainingLength(): number {
    return this.tokens.length - this.tokenIndex;
  }

}
