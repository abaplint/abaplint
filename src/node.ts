import { Token } from "./tokens/token";

export default class Node {
  private name: string;
  private children: Array<Node>;

  public constructor(name: string, token?: Token) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public addChild(n: Node) {
    this.children.push(n);
  }

  public setChildren(children: Array<Node>) {
    this.children = children;
  }

  public getChildren(): Array<Node> {
    return this.children;
  }
}