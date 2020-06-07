import {IFile} from "./files/_ifile";
import {Position} from "./position";
import {Token} from "./abap/1_lexer/tokens/_token";
import {Identifier} from "./abap/4_file_information/_identifier";
import {StatementNode} from "./abap/nodes";
import {IEdit} from "./edit_helper";

interface IIssueData {
  filename: string;
  message: string;
  key: string;
  start: Position;
  end: Position;
  fix?: IEdit;
}

export class Issue {
  private readonly data: IIssueData;

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

  public static atStatement(file: IFile, statement: StatementNode, message: string, key: string, fix?: IEdit) {
    return this.atPosition(file, statement.getStart(), message, key, fix);
  }

  public static atPosition(file: IFile, start: Position, message: string, key: string, fix?: IEdit) {
    const row = start.getRow();
    const end = new Position(row, file.getRawRows()[row - 1].length + 1);

    return new Issue({
      filename: file.getFilename(),
      message,
      key,
      start,
      end,
      fix,
    });
  }

  public static atRowRange(file: IFile, row: number, startCol: number, endCol: number, message: string, key: string) {
    const start = new Position(row, startCol);
    const end = new Position(row, endCol);

    return new Issue({
      filename: file.getFilename(),
      message,
      key,
      start,
      end,
    });
  }

  public static atRange(file: IFile, start: Position, end: Position, message: string, key: string, fix?: IEdit) {
    return new Issue({
      filename: file.getFilename(),
      message,
      key,
      start,
      end,
      fix,
    });
  }

  public static atToken(file: IFile, token: Token, message: string, key: string, fix?: IEdit) {
    return new Issue({
      filename: file.getFilename(),
      message,
      key,
      start: token.getStart(),
      end: token.getEnd(),
      fix,
    });
  }

  public static atIdentifier(identifier: Identifier, message: string, key: string, fix?: IEdit) {
    return new Issue({
      filename: identifier.getFilename(),
      message,
      key,
      start: identifier.getStart(),
      end: identifier.getEnd(),
      fix,
    });
  }

//////////////////////////

  private constructor(data: IIssueData) {
    this.data = data;

    if (this.data.start.getCol() < 1) {
      throw new Error("issue, start col < 1");
    } else if (this.data.end.getCol() < 1) {
      throw new Error("issue, end col < 1");
    }
  }

  public getMessage(): string {
    return this.data.message;
  }

  public getKey(): string {
    return this.data.key;
  }

  public getStart(): Position {
    return this.data.start;
  }

  public getEnd(): Position {
    return this.data.end;
  }

  public getFilename(): string {
    return this.data.filename;
  }

  public getFix() {
    return this.data.fix;
  }
}