import {Token, Pragma} from "../tokens/";
import Position from "../position";
import {BasicNode, StatementNode, TokenNode, ReuseNode} from ".././node";

export abstract class Statement extends StatementNode {

  public constructor(children: Array<BasicNode>) {
    super();
    this.children = children;

    if (children.length === 0) {
      throw "statement: zero children";
    }

    // validate child nodes
    children.forEach((c) => {
      if (!(c instanceof TokenNode || c instanceof ReuseNode)) {
//        console.trace();
        throw "statement: not token or reuse node";
      }
    });
  }

  public isStructure(): boolean {
    return false;
  }

  public isValidParent(_s: Statement): boolean {
    return true;
  }

  public isEnd() {
    return false;
  }

  public indentationStart(_prev: Statement): number {
    return 0;
  }

  public indentationEnd(_prev: Statement): number {
    return 0;
  }

  public indentationSetEnd(): number {
    return -1;
  }

  public indentationSetStart(): number {
    return -1;
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

  private toTokens(b: BasicNode): Array<Token> {
    let tokens: Array<Token> = [];

    if (b instanceof TokenNode) {
      tokens.push((b as TokenNode).getToken());
    }

    b.getChildren().forEach((c) => {
      if (c instanceof TokenNode) {
        tokens.push((c as TokenNode).getToken());
      } else {
        tokens = tokens.concat(this.toTokens(c));
      }
    });

    return tokens;
  }

}

export class Unknown extends Statement { }

export class Comment extends Statement { }

export class Empty extends Statement { }

export class MacroCall extends Statement { }

export class MacroContent extends Statement { }