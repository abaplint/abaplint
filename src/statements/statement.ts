import { Token, Pragma } from "../tokens/";
import Position from "../position";
import {StatementNode} from ".././node";

export abstract class Statement {
// todo, perhaps the tokens var can be removed, and root BasicNode used instead
  private tokens: Array<Token>;

// todo, variable "parent" + "children" to be removed? use AST instead
  private children: Array<Statement>;
  private parent: Statement;

  private root: StatementNode;

  public constructor(tokens: Array<Token>, root: StatementNode) {
    this.tokens   = tokens;
    this.children = [];
    this.parent   = undefined;
    this.root     = root;
  }

  public getRoot(): StatementNode {
    return this.root;
  }

  public isStructure(): boolean {
    return false;
  }

  public isValidParent(s: Statement): boolean {
    return true;
  }

  public isEnd() {
    return false;
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