import {Position} from "../../position";
import {Token} from "../tokens/_token";
import {INode} from "../nodes/_inode";

export abstract class Identifier {
  private name: string;
  private position: Position;
  private start: Position;
  private end: Position;

// todo, remove parameter _node?
  constructor(token: Token, _node: INode) {
    this.name = token.getStr();
    this.position = token.getStart();
    this.start = token.getStart();
    this.end = token.getEnd();

// todo, should this be handled in the parser instead?
    if (this.name.substr(0, 1) === "!") {
      this.name = this.name.substr(1);
    }
  }

  public getName() {
    return this.name;
  }

// hmm, consider how this can be refactored
  public setName(name: string): Identifier {
    this.name = name;
    return this;
  }

  public getPosition() {
    return this.position;
  }

  public getStart(): Position {
    return this.start;
  }

  public getEnd(): Position {
    return this.end;
  }
}