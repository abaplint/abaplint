import * as fs from "fs";
import * as path from "node:path";
import {Project} from "ts-morph";
import {handleStatement} from "./statements";

const OUTPUT_FOLDER = "abap/";

let project = new Project();

let input = "";
input += fs.readFileSync("../core/src/position.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/virtual_position.ts", "utf-8") + "\n";
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

let diagnostics = project.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
} else {
  let result = "";
  for (const s of file.getStatements()) {
    result += handleStatement(s, {
      globalObjects: false,
      nameMap: {},
    });
  }
  result = "* auto generated, do not touch\n" + result;
  fs.writeFileSync("abap/zcl_alint_lexer.clas.locals_imp.abap", result);
}

////////////////////////////////////////////

project = new Project();

const handle = [{
  inputFile: "../core/src/position.ts",
  inputClassName: "Position",
  outputClassName: "zcl_alint_position",
}];

const nameMap: {[name: string]: string} = {};
for (const h of handle) {
  nameMap[h.inputClassName] = h.outputClassName;
  project.createSourceFile(path.basename(h.inputFile), fs.readFileSync(h.inputFile, "utf-8"));
}
diagnostics = project.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
} else {
  for (const h of handle) {
    const file = project.getSourceFile(path.basename(h.inputFile));
    let result = "";
    for (const s of file?.getStatements() || []) {
      result += handleStatement(s, {
        globalObjects: true,
        nameMap: nameMap,
      });
    }
    result = "* auto generated, do not touch\n" + result;
    fs.writeFileSync(OUTPUT_FOLDER + h.outputClassName + ".clas.abap", result);
  }
}