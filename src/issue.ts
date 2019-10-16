import {IFile} from "./files/_ifile";
import {Position} from "./position";

interface IIssueData {
  file: IFile;
  message: string;
  key: string;
  start?: Position;
  end?: Position;
}

export class Issue {
  private readonly start: Position;
  private readonly end: Position;
  private readonly file: IFile;
  private readonly message: string;
  private readonly key: string;

  public constructor(data: IIssueData) {
    this.message = data.message;
    this.key = data.key;

    if (!data.start) {
      this.start = new Position(1, 1);
    } else {
      this.start = data.start;
    }

    if (!data.end) {
      this.end = new Position(
        this.start.getRow(),
        data.file.getRawRows()[this.start.getRow() - 1].length + 1);
    } else {
      this.end = data.end;
    }

    if (this.start.getCol() < 1) {
      throw new Error("issue, start col < 1");
    } else if (this.end.getCol() < 1) {
      throw new Error("issue, end col < 1");
    }

    this.file = data.file;
  }

  public getMessage(): string {
    return this.message;
  }

  public getKey(): string {
    return this.key;
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