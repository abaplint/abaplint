import * as fs from "fs";
import {Project} from "ts-morph";
import {handleStatement} from "./statements";

const project = new Project();

const input = fs.readFileSync("../core/src/position.ts").toString("utf-8");

const file = project.createSourceFile("input.ts", input);

const diagnostics = project.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
} else {
  let result = "";
  for (const s of file.getStatements()) {
    result += handleStatement(s);
  }
  fs.writeFileSync("zresult.prog.abap", result);
}