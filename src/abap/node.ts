import {Token} from "./tokens/_token";
import {Expression} from "./combi";

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
}

export abstract class StatementNode extends BasicNode {

}

export class StructureNode extends BasicNode {

  public constructor() {
    super();
  }

}

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

  public getExpression(): Expression {
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

  public getToken(): Token {
    return this.token;
  }

  public countTokens(): number {
    return super.countTokens() + 1;
  }

  public getName(): string {
    return this.name;
  }

}