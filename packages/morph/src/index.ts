import * as fs from "fs";
import {Project} from "ts-morph";
import {handleStatement} from "./statements";

const project = new Project();

let input = "";
input += fs.readFileSync("../core/src/position.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/_token.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/at.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/bracket_left.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/bracket_right.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/colon.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/comment.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/dash.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/identifier.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/instance_arrow.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/paren_left.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/paren_right.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/plus.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/pragma.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/punctuation.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/static_arrow.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/string.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/files/_ifile.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/lexer_result.ts").toString("utf-8").replace(/import .*/g, "");
input += fs.readFileSync("../core/src/abap/1_lexer/lexer.ts").toString("utf-8").replace(/import .*/g, "");
fs.writeFileSync("blah.ts", input, {encoding: "utf8", flag: "w"});

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