import {IFile} from "./files/_ifile";
import {Position} from "./position";
import {Token} from "./abap/tokens/_token";
import {Identifier} from "./abap/types/_identifier";
import {StatementNode} from "./abap/nodes";

interface IIssueData {
  filename: string;
  message: string;
  key: string;
  start: Position;
  end: Position;
}

export class Issue {
  private readonly start: Position;
  private readonly end: Position;
  private readonly filename: string;
  private readonly message: string;
  private readonly key: string;

//////////////////////////

  public static atRow(file: IFile, row: number, message: string, key: string) {
    const start = new Position(row, 1);
    const end = new Position(row, file.getRawRows()[row - 1].length + 1);

    return new Issue({
      filename: file.getFilename(),
      message,
      key,
      start,
      end,
    });
  }

  public static atStatement(file: IFile, statement: StatementNode, message: string, key: string) {
    return this.atRow(file, statement.getStart().getRow(), message, key);
  }

  public static atPosition(file: IFile, start: Position, message: string, key: string) {
    const row = start.getRow();
    const end = new Position(row, file.getRawRows()[row - 1].length + 1);

    return new Issue({
      filename: file.getFilename(),
      message,
      key,
      start,
      end,
    });
  }

  public static atToken(file: IFile, token: Token, message: string, key: string) {
    return new Issue({
      filename: file.getFilename(),
      message,
      key,
      start: token.getStart(),
      end: token.getEnd(),
    });
  }

  public static atIdentifier(identifier: Identifier, message: string, key: string) {
    return new Issue({
      filename: identifier.getFilename(),
      message,
      key,
      start: identifier.getStart(),
      end: identifier.getEnd(),
    });
  }

//////////////////////////

  public constructor(data: IIssueData) {
    this.message = data.message;
    this.key = data.key;
    this.start = data.start;
    this.end = data.end;
    this.filename = data.filename;

    if (this.start.getCol() < 1) {
      throw new Error("issue, start col < 1");
    } else if (this.end.getCol() < 1) {
      throw new Error("issue, end col < 1");
    }
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

  public getFilename(): string {
    return this.filename;
  }
}