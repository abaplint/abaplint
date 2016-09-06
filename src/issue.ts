import {IRule} from "./rules/";
import {File} from "./file";
import Position from "./position";

export class Issue {
  private rule: IRule;
  private start: Position;
  private end: Position;
  private file: File;

  public constructor(rule: IRule, start: Position, file: File, end?: Position) {
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

  public getRule(): IRule {
    return this.rule;
  }

  public getStart(): Position {
    return this.start;
  }

  public getEnd(): Position {
    return this.end;
  }

  public getFile(): File {
    return this.file;
  }
}