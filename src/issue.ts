import { Rule } from "./rules/";
import File from "./file";
import Position from "./position";

export default class Issue {

  private rule: Rule;
  private start: Position;
  private end: Position;
  private file: File;

  constructor(rule: Rule, start: Position, file: File, end?: Position) {
    this.rule = rule;
    this.start = start;
    if (!end) {
      this.end = new Position(start.getRow(), file.getRawRows()[start.getRow() - 1].length);
    }
    this.file = file;
  }

  public getDescription(): string {
    return this.rule.getDescription();
  }

  public getKey(): string {
    return this.rule.getKey();
  }

  public getStart(): Position {
    return this.start;
  }

  public getEnd(): Position {
    return this.end;
  }

}