import {IRule} from "./rules/";
import {IFile} from "./files";
import Position from "./position";

export class Issue {
  private rule: IRule;
  private start: Position;
  private end: Position;
  private file: IFile;
  private message: number;

  public constructor(rule: IRule, file: IFile, message: number, start?: Position, end?: Position) {
    this.rule = rule;
    this.message = message;

    this.start = start;
    if (!this.start) {
      this.start = new Position(1, 1);
    }

    if (!end) {
      this.end = new Position(
        this.start.getRow(),
        file.getRawRows()[this.start.getRow() - 1].length);
    }

    this.file = file;
  }

  public getRuleDescription(): string {
    return this.rule.getDescription();
  }

  public getMessage(): string {
    return this.rule.getMessage(this.message);
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

  public getFile(): IFile {
    return this.file;
  }
}