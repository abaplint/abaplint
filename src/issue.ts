import {IFile} from "./files/_ifile";
import Position from "./position";

interface IssueData {
  file: IFile;
  message: string;
  start?: Position;
  end?: Position;
}

export class Issue {
  private start: Position;
  private end: Position;
  private file: IFile;
  private message: string;

  public constructor(data: IssueData) {
    this.message = data.message;

    this.start = data.start;
    if (!this.start) {
      this.start = new Position(1, 1);
    }

    if (!data.end) {
      this.end = new Position(
        this.start.getRow(),
        data.file.getRawRows()[this.start.getRow() - 1].length);
    }

    this.file = data.file;
  }

  public getMessage(): string {
    return this.message;
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