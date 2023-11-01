import * as fs from "fs";
import {Project} from "ts-morph";
import {handleStatement} from "./statements";

const project = new Project();

let input = "";
input += fs.readFileSync("../core/src/position.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/_token.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/at.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/bracket_left.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/bracket_right.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/colon.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/comment.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/dash.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/identifier.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/instance_arrow.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/paren_left.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/paren_right.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/plus.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/pragma.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/punctuation.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/static_arrow.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/string.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/files/_ifile.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/files/_abstract_file.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/files/memory_file.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/lexer_result.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/lexer.ts", "utf-8") + "\n";

input = input.replace(/import .*/g, "");
input = input.replace("export type IABAPLexerResult", "type IABAPLexerResult");

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
  result = "* auto generated, do not touch\n" + result;
  fs.writeFileSync("abap/zcl_alint_lexer.clas.locals_imp.abap", result);
}

////////////////////////////////////////////
/*
const handle = [{
  inputFile: "../core/src/position.ts",
  outputName: "zcl_alint_position",
}];

for (const h of handle) {

}
*/