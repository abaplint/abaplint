import {Token} from "./tokens/_token";
import {Expression} from "./combi";
import {Structure} from "./structures/_structure";
import {Statement} from "./statements/_statement";
import {Pragma} from "./tokens";
import Position from "../position";

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

export class StatementNode extends BasicNode {
  private statement: Statement;

  public constructor(statement: Statement) {
    super();
    this.statement = statement;
  }

  public get() {
    return this.statement;
  }

  public setChildren(children: INode[]): StatementNode {
    if (children.length === 0) {
      throw "statement: zero children";
    }
// commented to optimize performance
/*
    // validate child nodes
    children.forEach((c) => {
      if (!(c instanceof TokenNode || c instanceof ExpressionNode)) {
        throw "statement: not token or expression node";
      }
    });
*/
    this.children = children;

    return this;
  }

  public getStart(): Position {
    return this.getTokens()[0].getPos();
  }

  public getEnd(): Position {
    let tokens = this.getTokens();
    let last = tokens[tokens.length - 1];

    let pos = new Position(last.getPos().getRow(),
                           last.getPos().getCol() + last.getStr().length);

    return pos;
  }

  public getTokens(): Array<Token> {
    let tokens: Array<Token> = [];

    this.getChildren().forEach((c) => {
      tokens = tokens.concat(this.toTokens(c));
    });

    return tokens;
  }

  public concatTokens(): string {
    let str = "";
    let prev: Token;
    for (let token of this.getTokens()) {
      if (token instanceof Pragma) {
        continue;
      }
      if (str === "") {
        str = token.getStr();
      } else if (prev.getStr().length + prev.getCol() === token.getCol()
          && prev.getRow() === token.getRow()) {
        str = str + token.getStr();
      } else {
        str = str + " " + token.getStr();
      }
      prev = token;
    }
    return str;
  }

  public getTerminator(): string {
    return this.getTokens()[this.getTokens().length - 1].getStr();
  }

  private toTokens(b: INode): Array<Token> {
    let tokens: Array<Token> = [];

    if (b instanceof TokenNode) {
      tokens.push((b as TokenNode).get());
    }

    b.getChildren().forEach((c) => {
      if (c instanceof TokenNode) {
        tokens.push((c as TokenNode).get());
      } else {
        tokens = tokens.concat(this.toTokens(c));
      }
    });

    return tokens;
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
}

export class TokenNode extends CountableNode {
  private token: Token;

  public constructor(token: Token) {
    super();
    this.token = token;
  }

  public get(): Token {
    return this.token;
  }

  public countTokens(): number {
    return super.countTokens() + 1;
  }
}