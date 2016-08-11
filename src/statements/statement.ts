import { Token, Pragma } from "../tokens/";
import Position from "../position";
import Node from ".././node";

export abstract class Statement {
  private tokens: Array<Token>;

  private children: Array<Statement>;
  private parent: Statement;

  private root: Node;

  public static concat(tokens: Array<Token>): string {
    let str = "";
    let prev: Token;
    for (let token of tokens) {
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

  public constructor(tokens: Array<Token>, root?: Node) {
    this.tokens   = tokens;
    this.children = [];
    this.parent   = undefined;
    this.root     = root;
  }

  public getRoot(): Node {
    return this.root;
  }

  public addChild(child: Statement) {
    this.children.push(child);
  }

  public setParent(parent: Statement) {
    this.parent = parent;
  }

  public getChildren() {
    return this.children;
  }

  public getParent() {
    return this.parent;
  }

  public getStart(): Position {
    return this.tokens[0].getPos();
  }

  public getEnd(): Position {
    let last = this.tokens[this.tokens.length - 1];
    let pos = new Position(last.getPos().getRow(), last.getPos().getCol() + last.getStr().length);
    return pos;
  }

  public getTokens(): Array<Token> {
    return this.tokens;
  }

  public concatTokens(): string {
    return Statement.concat(this.tokens);
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