import { Token } from "./tokens/token";
import { Statement } from "./statements/statement";

export abstract class BasicNode {
  private name: string;
  private parent: BasicNode;
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
    n.setParent(this);
    return this;
  }

  public getParent(): BasicNode {
    return this.parent;
  }

  public setParent(p: BasicNode): void {
    this.parent = p;
  }

  public setChildren(children: Array<BasicNode>): BasicNode {
// todo, set parents?
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
    return "Root: " + super.getName();
  }
}

export class StatementNode extends BasicNode {
  public vizName() {
    return "Statement: " + super.getName();
  }
}

export class StructureNode extends BasicNode {
  private start: Statement;
  private end: Statement;

  public constructor(st: Statement) {
    super(st.getRoot().getName());
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
    return "Structure: " + this.start.getRoot().getName();
  }

  public viz(): string {
    let children = this.getChildren().map((e) => { return e.viz(); } );

    let ret = "<ul><li>" + this.vizName() +
      "<ul><li>Start: " + this.start.getRoot().viz() + "</li></ul>" +
      "<ul><li>Body: " + children.join("") + "</li></ul>" +
      "<ul><li>End: " + ( this.end ? this.end.getRoot().viz() : "" ) + "</li></ul>" +
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

  public getToken(): Token {
    return this.token;
  }

  public countTokens(): number {
    return super.countTokens() + 1;
  }

  public vizName() {
    return "Token: " + super.getName() + " (\"" + this.token.getStr() + "\")";
  }
}