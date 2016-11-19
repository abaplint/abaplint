import { Token, Pragma } from "../tokens/";
import Position from "../position";
import {BasicNode, StatementNode} from ".././node";

export abstract class Statement extends StatementNode {
// todo, perhaps the tokens var can be removed, and children used instead
  private tokens: Array<Token>;

  public constructor(tokens: Array<Token>, children: Array<BasicNode>) {
    super();
    this.tokens = tokens;
    this.children = children;
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
    return this.tokens[0].getPos();
  }

  public getEnd(): Position {
    let last = this.tokens[this.tokens.length - 1];

    let pos = new Position(last.getPos().getRow(),
                           last.getPos().getCol() + last.getStr().length);

    return pos;
  }

  public getTokens(): Array<Token> {
    return this.tokens;
  }

  public concatTokens(): string {
    let str = "";
    let prev: Token;
    for (let token of this.tokens) {
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
}

export class Unknown extends Statement { }

export class Comment extends Statement { }

export class Empty extends Statement { }

export class MacroCall extends Statement { }

export class MacroContent extends Statement { }