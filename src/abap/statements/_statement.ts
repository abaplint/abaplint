import {Pragma} from "../tokens";
import {Token} from "../tokens/_token";
import Position from "../../position";
import {BasicNode, StatementNode, TokenNode, ReuseNode} from "../node";
import {IRunnable} from "../combi";

export abstract class Statement extends StatementNode {

  public setChildren(children: Array<BasicNode>): Statement {
    this.children = children;

    if (children.length === 0) {
      throw "statement: zero children";
    }

    // validate child nodes
    children.forEach((c) => {
      if (!(c instanceof TokenNode || c instanceof ReuseNode)) {
        throw "statement: not token or reuse node";
      }
    });

    return this;
  }

  public abstract getMatcher(): IRunnable;

  /*
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
  */

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

export class Unknown extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("Unknown Statement, get_matcher");
  }
}

export class Comment extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("Comment Statement, get_matcher");
  }
}

export class Empty extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("Empty Statement, get_matcher");
  }
}

export class MacroCall extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("MacroCall Statement, get_matcher");
  }
}

export class MacroContent extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("MacroContent Statement, get_matcher");
  }
}

export class NativeSQL extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("NativeSQL Statement, get_matcher");
  }
}