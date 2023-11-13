import * as fs from "fs";
import {Project} from "ts-morph";
import {handleStatement} from "./statements";

const OUTPUT_FOLDER1 = "abap1/";

const project = new Project();

let input = "";
input += fs.readFileSync("../core/src/position.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/virtual_position.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/abstract_token.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/at.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wat.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/atw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/watw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/bracket_left.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wbracket_left.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/bracket_leftw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wbracket_leftw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/bracket_right.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wbracket_right.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/bracket_rightw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wbracket_rightw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/instance_arrow.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/winstance_arrow.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/instance_arroww.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/winstance_arroww.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/paren_left.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wparen_left.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/paren_leftw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wparen_leftw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/paren_right.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wparen_right.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/paren_rightw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wparen_rightw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/dash.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wdash.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/dashw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wdashw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/plus.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wplus.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/plusw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wplusw.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/static_arrow.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wstatic_arrow.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/static_arroww.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/wstatic_arroww.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/string.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/string_template.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/string_template_begin.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/string_template_end.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/string_template_middle.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/colon.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/comment.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/identifier.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/pragma.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/tokens/punctuation.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/files/_ifile.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/files/_abstract_file.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/files/memory_file.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/lexer_result.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/lexer_stream.ts", "utf-8") + "\n";
input += fs.readFileSync("../core/src/abap/1_lexer/lexer_buffer.ts", "utf-8") + "\n";
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
    result += handleStatement(s, {
      globalObjects: false,
      nameMap: {},
    });
  }
  result = "* auto generated, do not touch\n" + result;
  fs.writeFileSync(OUTPUT_FOLDER1 + "zcl_alint_lexer.clas.locals_imp.abap", result);
}
