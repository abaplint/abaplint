import {Token} from "./tokens/token";
import {Reuse} from "./combi";
import {Statement} from "./statements/statement";

function className(cla) {
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

  public viz(): string {
    let children = this.getChildren().map((e) => { return e.viz(); } );
    let ret = "<ul><li>" + this.vizName() + children.join("") + "</li></ul>";

    return ret;
  }
}

export class RootNode extends BasicNode {
  public vizName() {
    return "Root";
  }
}

export abstract class StatementNode extends BasicNode {
  public vizName() {
    return "Statement: " + className(this);
  }
}

export class StructureNode extends BasicNode {
  private start: Statement;
  private end: Statement;

  public constructor(st: Statement) {
    super();
    this.start = st;
  }

  public getStart(): Statement {
    return this.start;
  }

  public setEnd(e: Statement) {
    this.end = e;
  }

  public getEnd(): Statement {
    return this.end;
  }

  public vizName() {
    return "Structure: start, todo";
  }

  public viz(): string {
    let children = this.getChildren().map((e) => { return e.viz(); } );

//    console.log(this.start.constructor);
    let ret = "<ul><li>" + this.vizName() +
      "<ul><li>Start: " + this.start.viz() + "</li></ul>" +
      "<ul><li>Body: " + children.join("") + "</li></ul>" +
      "<ul><li>End: " + ( this.end ? this.end.viz() : "" ) + "</li></ul>" +
      "</li></ul>";

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
  private reuse: Reuse;

  public constructor(reuse: Reuse) {
    super();
    this.reuse = reuse;
  }

  public getReuse(): Reuse {
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

  public vizName() {
    return "Token: " +
      className(this.token) +
      " " +
      this.name +
      " (\"" + this.token.getStr() +
      "\")";
  }
}