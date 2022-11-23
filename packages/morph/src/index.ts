import {Project} from "ts-morph";
import {handleStatement} from "./statements";

const project = new Project();

const file = project.createSourceFile("input.ts", `class Stream {
  private readonly raw: string;
  private offset = -1;
  private row: number;
  private col: number;

  public constructor(raw: string) {
    this.raw = raw;
    this.row = 0;
    this.col = 0;
  }

  public advance(): boolean {
    if (this.currentChar() === "n") {
      this.col = 1;
      this.row = this.row + 1;
    } else if (this.col  === 3) {
      this.col = 12;
    }

    if (this.offset === this.raw.length) {
      return false;
    }

    this.col = this.col + 1;

    this.offset = this.offset + 1;
    return true;
  }

  public getCol(): number {
    return this.col;
  }

  public getRow(): number {
    return this.row;
  }

  public prevChar(): string {
    return this.raw.substr(this.offset - 1, 1);
  }

  public prevPrevChar(): string {
    return this.raw.substr(this.offset - 2, 2);
  }

  public currentChar(): string {
    if (this.offset < 0) {
      return "n"; // simulate newline at start of file to handle star(*) comments
    }
    return this.raw.substr(this.offset, 1);
  }

  public nextChar(): string {
    return this.raw.substr(this.offset + 1, 1);
  }

  public nextNextChar(): string {
    return this.raw.substr(this.offset + 1, 2);
  }

  public getRaw(): string {
    return this.raw;
  }

  public getOffset() {
    return this.offset;
  }
}`);

const diagnostics = project.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
} else {
  let result = "";
  for (const s of file.getStatements()) {
    result += handleStatement(s);
  }
  console.log(result);
}