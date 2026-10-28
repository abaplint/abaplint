import {INode} from "./_inode";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";

// shared constant, so nodes without children don't waste memory on empty arrays
const EMPTY: readonly INode[] = Object.freeze([]);

export abstract class AbstractNode<T extends INode> implements INode {
  // a single child is stored directly, most nodes have exactly one child and an array costs ~56 bytes
  private children: T | T[];

  public constructor() {
    this.children = EMPTY as T[];
  }

  public abstract get(): any;
  public abstract getFirstToken(): AbstractToken;
  public abstract getLastToken(): AbstractToken;

  public addChild(n: T) {
    if (this.children === EMPTY) {
      this.children = n;
    } else if (Array.isArray(this.children)) {
      this.children.push(n);
    } else {
      this.children = [this.children, n];
    }
  }

  public setChildren(children: T[]) {
    if (children.length === 1) {
      this.children = children[0];
    } else {
      // copy, input arrays are built via push() and carry over-allocated backing stores
      this.children = children.length === 0 ? EMPTY as T[] : children.slice();
    }
  }

  public getChildren(): readonly T[] {
    const children = this.children;
    return Array.isArray(children) ? children : [children];
  }

  public getFirstChild(): T | undefined {
    const children = this.children;
    return Array.isArray(children) ? children[0] : children;
  }

  public getLastChild(): T | undefined {
    const children = this.children;
    return Array.isArray(children) ? children[children.length - 1] : children;
  }

}
