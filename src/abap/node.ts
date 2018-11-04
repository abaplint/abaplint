import {Token} from "./tokens/_token";
import {Expression} from "./combi";

function className(cla: any) {
  return (cla.constructor + "").match(/\w+/g)[1];
}

export abstract class BasicNode {
  protected children: Array<BasicNode>;

  public constructor() {
    this.children = [];
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

// todo, this method should be deleted? it is frontend
  public viz(): string {
    let children = this.getChildren().map((e) => { return e.viz(); } );
    let ret = "<ul><li>" + this.vizName() + children.join("") + "</li></ul>";

    return ret;
  }
}

export abstract class StatementNode extends BasicNode {
  public vizName() {
    return "Statement: " + className(this);
  }
}

export class StructureNode extends BasicNode {

  public constructor() {
    super();
  }

  public vizName() {
    return "Structure: todo";
  }

  public viz(): string {
    let ret = "StructureNode, todo<br>";
    return ret;
  }
}

export abstract class CountableNode extends BasicNode {
  public countTokens(): number {
    let count = this.getChildren().reduce((a, b) => { return a + (b as CountableNode).countTokens(); }, 0);
    return count;
  }
}

export class ReuseNode extends CountableNode {
  private reuse: Expression;

  public constructor(reuse: Expression) {
    super();
    this.reuse = reuse;
  }

  public getReuse(): Expression {
    return this.reuse;
  }

  public getName() {
    return className(this.reuse);
  }

  public vizName() {
    return "Reuse: " + this.getName();
  }
}

export class TokenNode extends CountableNode {
  private token: Token;
  private name: string;

  public constructor(name: string, token: Token) {
    super();
    this.name = name;
    this.token = token;
  }

  public getToken(): Token {
    return this.token;
  }

  public countTokens(): number {
    return super.countTokens() + 1;
  }

// todo
//  public getName

  public vizName() {
    return "Token: " +
      className(this.token) +
      " " +
      this.name +
      " (\"" + this.token.getStr() +
      "\")";
  }
}