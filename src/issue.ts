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
  private start: Position;
  private end: Position;
  private file: IFile;
  private message: string;
  private key: string;

  public constructor(data: IIssueData) {
    this.message = data.message;
    this.key = data.key;

    if (!data.start) {
      this.start = new Position(1, 1);
    } else {
      if (data.start.getCol() < 1) {
        throw new Error("issue, row < 1");
      }
      this.start = data.start;
    }

    if (!data.end) {
      this.end = new Position(
        this.start.getRow(),
        data.file.getRawRows()[this.start.getRow() - 1].length);
    } else {
      this.end = data.end;
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