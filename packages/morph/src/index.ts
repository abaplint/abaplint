import {Project} from "ts-morph";
import {handleStatement} from "./statements";

const project = new Project();

const file = project.createSourceFile("input.ts", `export interface IFile {
  getFilename(): string;
  getObjectType(): string | undefined;
  getObjectName(): string;
  getRaw(): string;
  getRawRows(): string[];
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