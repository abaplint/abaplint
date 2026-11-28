import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {IStatementRunnable} from "../2_statements/statement_runnable";
import {TokenNode} from "./token_node";
import type {ExpressionNode} from "./expression_node";

// Walks over the children of a statement or expression with a stack instead of recursion, the
// order is the one of the recursion: depth first, a node before its children, left to right.
// Expressions can nest thousands deep, eg. a chain of "&&" gives one Source per operator

type Child = ExpressionNode | TokenNode;

function pushReversed(stack: Child[], children: readonly Child[]) {
  for (let i = children.length - 1; i >= 0; i--) {
    stack.push(children[i]);
  }
}

export function walkTokenNodes(children: readonly Child[]): TokenNode[] {
  const ret: TokenNode[] = [];
  const stack: Child[] = [];
  pushReversed(stack, children);
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node instanceof TokenNode) {
      ret.push(node);
    } else {
      pushReversed(stack, node.getChildren());
    }
  }
  return ret;
}

export function walkTokens(children: readonly Child[]): AbstractToken[] {
  const ret: AbstractToken[] = [];
  const stack: Child[] = [];
  pushReversed(stack, children);
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node instanceof TokenNode) {
      ret.push(node.get());
    } else {
      pushReversed(stack, node.getChildren());
    }
  }
  return ret;
}

export function walkCountTokens(children: readonly Child[]): number {
  let count = 0;
  const stack: Child[] = [...children];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node instanceof TokenNode) {
      count++;
    } else {
      stack.push(...node.getChildren());
    }
  }
  return count;
}

/** first expression of the type, an expression of the type is not searched below */
export function walkFindFirst(children: readonly Child[], type: new () => IStatementRunnable): ExpressionNode | undefined {
  const stack: Child[] = [];
  pushReversed(stack, children);
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node instanceof TokenNode) {
      continue;
    } else if (node.get() instanceof type) {
      return node;
    }
    pushReversed(stack, node.getChildren());
  }
  return undefined;
}

/** all expressions of the type, below an expression of the type only if "recursive" */
export function walkFindAll(children: readonly Child[], type: new () => IStatementRunnable, recursive: boolean): ExpressionNode[] {
  const ret: ExpressionNode[] = [];
  const stack: Child[] = [];
  pushReversed(stack, children);
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node instanceof TokenNode) {
      continue;
    } else if (node.get() instanceof type) {
      ret.push(node);
      if (recursive === false) {
        continue;
      }
    }
    pushReversed(stack, node.getChildren());
  }
  return ret;
}

/** all expressions of any of the types, once per matching type, below a match only if "recursive" */
export function walkFindAllMulti(children: readonly Child[], types: (new () => IStatementRunnable)[],
                                 recursive: boolean): ExpressionNode[] {
  const ret: ExpressionNode[] = [];
  const stack: Child[] = [];
  pushReversed(stack, children);
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node instanceof TokenNode) {
      continue;
    }
    const before = ret.length;
    for (const t of types) {
      if (node.get() instanceof t) {
        ret.push(node);
      }
    }
    if (before === ret.length || recursive === true) {
      pushReversed(stack, node.getChildren());
    }
  }
  return ret;
}

export function walkFirstToken(first: Child, error: string): AbstractToken {
  let node: Child = first;
  while (!(node instanceof TokenNode)) {
    const children = node.getChildren();
    if (children.length === 0) {
      throw new Error(error);
    }
    node = children[0];
  }
  return node.get();
}

export function walkLastToken(last: Child, error: string): AbstractToken {
  let node: Child = last;
  while (!(node instanceof TokenNode)) {
    const child = node.getLastChild();
    if (child === undefined) {
      throw new Error(error);
    }
    node = child;
  }
  return node.get();
}
