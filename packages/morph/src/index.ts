import {Project} from "ts-morph";
import {handleStatement} from "./statements";

const project = new Project();

const file = project.createSourceFile("input.ts", `class Buffer {
  private buf: string;

  public constructor() {
    this.buf = "";
  }

  public add(s: string): void {
    this.buf = this.buf + s;
  }

  public get(): string {
    return this.buf;
  }

  public clear(): void {
    this.buf = "";
  }
}`);

let result = "";

for (const s of file.getStatements()) {
  result += handleStatement(s);
}

console.log(result);