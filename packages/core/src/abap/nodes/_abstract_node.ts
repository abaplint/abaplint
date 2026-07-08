import {INode} from "./_inode";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";

// shared constant, so nodes without children don't waste memory on empty arrays
const EMPTY: readonly INode[] = Object.freeze([]);

export abstract class AbstractNode<T extends INode> implements INode {
  protected children: T[];

  public constructor() {
    this.children = EMPTY as T[];
  }

  public abstract get(): any;
  public abstract getFirstToken(): AbstractToken;
  public abstract getLastToken(): AbstractToken;

  public addChild(n: T) {
    if (this.children === EMPTY) {
      this.children = [];
    }
    this.children.push(n);
  }

  public setChildren(children: T[]) {
    // copy, input arrays are built via push() and carry over-allocated backing stores
    this.children = children.slice();
  }

  public getChildren(): readonly T[] {
    return this.children;
  }

  public getFirstChild(): T | undefined {
    return this.children[0];
  }

  public getLastChild(): T | undefined {
    return this.children[this.children.length - 1];
  }

}