import {INode} from "./_inode";

export abstract class BasicNode implements INode {
  protected children: INode[];

  public constructor() {
    this.children = [];
  }

  public abstract get(): any;

  public addChild(n: INode): INode {
    this.children.push(n);
    return this;
  }

  public setChildren(children: INode[]): INode {
    this.children = children;
    return this;
  }

  public getChildren(): INode[] {
    return this.children;
  }

  public getFirstChild(): INode | undefined {
    return this.children[0];
  }

  public getLastChild(): INode | undefined {
    return this.children[this.children.length - 1];
  }
}