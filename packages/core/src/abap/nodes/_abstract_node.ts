import {INode} from "./_inode";
import {Token} from "../1_lexer/tokens/_token";

export abstract class AbstractNode implements INode {
  protected children: INode[];

  public constructor() {
    this.children = [];
  }

  public abstract get(): any;
  public abstract getFirstToken(): Token;
  public abstract getLastToken(): Token;

  public addChild(n: INode) {
    this.children.push(n);
  }

  public setChildren(children: INode[]) {
    this.children = children;
  }

  public getChildren(): readonly INode[] {
    return this.children;
  }

  public getFirstChild(): INode | undefined {
    return this.children[0];
  }

  public getLastChild(): INode | undefined {
    return this.children[this.children.length - 1];
  }

}