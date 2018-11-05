import {Token} from "./tokens/_token";
import {Expression} from "./combi";
import {Structure} from "./structures/_structure";
// import {Statement} from "./statements/_statement";

export interface INode {
  addChild(n: INode): INode;
  setChildren(children: INode[]): INode;
  getChildren(): INode[];
  get(): any;
}

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
}

export abstract class StatementNode extends BasicNode {
  public get(): undefined {
// todo
    return undefined;
  }
}

export class StructureNode extends BasicNode {
  private structure: Structure;

  public constructor(structure: Structure) {
    super();
    this.structure = structure;
  }

  public get() {
    return this.structure;
  }

}

// todo, delete this, to be implemented elsewhere
export abstract class CountableNode extends BasicNode {
  public countTokens(): number {
    let count = this.getChildren().reduce((a, b) => { return a + (b as CountableNode).countTokens(); }, 0);
    return count;
  }
}

export class ExpressionNode extends CountableNode {
  private expression: Expression;

  public constructor(expression: Expression) {
    super();
    this.expression = expression;
  }

  public get() {
    return this.expression;
  }

  public getName() {
    return this.expression.constructor.name;
  }

}

export class TokenNode extends CountableNode {
  private token: Token;
  private name: string;

  public constructor(name: string, token: Token) {
    super();
// todo, can name be removed, and instead use token.constructor.name?
    this.name = name;
    this.token = token;
  }

  public get(): Token {
    return this.token;
  }

  public countTokens(): number {
    return super.countTokens() + 1;
  }

  public getName(): string {
    return this.name;
  }

}