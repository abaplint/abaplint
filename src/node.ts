import { Token } from "./tokens/token";

export abstract class BasicNode {
  private name: string;
  private children: Array<BasicNode>;

  public constructor(name: string) {
    this.name     = name;
    this.children = [];
  }

  public getName(): string {
    return this.name;
  }

  public addChild(n: BasicNode): BasicNode {
    this.children.push(n);
    return this;
  }

  public setChildren(children: Array<BasicNode>): BasicNode {
    this.children = children;
    return this;
  }

  public getChildren(): Array<BasicNode> {
    return this.children;
  }

  public abstract vizName(): string;

  public viz(): string {
    let children = this.getChildren().map((e) => { return e.viz(); } );
    let ret = "<ul><li>" + this.vizName() + children.join("") + "</li></ul>";

    return ret;
  }
}

export class StatementNode extends BasicNode {
  public vizName() {
    return "Statement: " + super.getName();
  }
}

export abstract class CountableNode extends BasicNode {
  public countTokens(): number {
    let count = this.getChildren().reduce((a, b) => { return a + (b as CountableNode).countTokens(); }, 0);
    return count;
  }
}

export class ReuseNode extends CountableNode {
  public vizName() {
    return "Reuse: " + super.getName();
  }
}

export class TokenNode extends CountableNode {
  private token: Token;

  public constructor(name: string, token: Token) {
    super(name);
    this.token = token;
  }

  public countTokens(): number {
    return super.countTokens() + 1;
  }

  public vizName() {
    return "Token: " + super.getName() + " (\"" + this.token.getStr() + "\")";
  }
}