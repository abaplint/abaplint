import { Token } from "./tokens/token";

export default class Node {
  private name: string;
  private children: Array<Node>;
  private token: Token;

  public constructor(name: string, token?: Token) {
    this.name     = name;
    this.token    = token;
    this.children = [];
  }

  public getName(): string {
    return this.name;
  }

  public addChild(n: Node): Node {
    this.children.push(n);
    return this;
  }

  public setChildren(children: Array<Node>): Node {
    this.children = children;
    return this;
  }

  public getChildren(): Array<Node> {
    return this.children;
  }

  public viz(): string {
    let children = this.children.map((e) => { return e.viz(); } );
    let name = this.name;
    if (this.token) {
      name = name + " (\"" + this.token.getStr() + "\")";
    }
    let ret = "<ul><li>" + name + children.join("") + "</li></ul>";

    return ret;
  }
}