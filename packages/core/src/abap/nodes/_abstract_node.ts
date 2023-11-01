import {INode} from "./_inode";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";

export abstract class AbstractNode<T extends INode> implements INode {
  protected children: T[];

  public constructor() {
    this.children = [];
  }

  public abstract get(): any;
  public abstract getFirstToken(): AbstractToken;
  public abstract getLastToken(): AbstractToken;

  public addChild(n: T) {
    this.children.push(n);
  }

  public setChildren(children: T[]) {
    this.children = children;
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