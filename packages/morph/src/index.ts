import * as fs from "fs";
import * as path from "node:path";
import {Project} from "ts-morph";
import {handleStatement} from "./statements";

const OUTPUT_FOLDER1 = "abap1/";
const OUTPUT_FOLDER2 = "abap2/";
const INPUT_FOLDER = "../core/src/";

let project = new Project();

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
  fs.writeFileSync(OUTPUT_FOLDER1 + "zcl_alint_lexer.clas.locals_imp.abap", result);
}

////////////////////////////////////////////

project = new Project();

const classes = [
  {inputFile: "position.ts", inputClassName: "Position", outputClassName: "zcl_alint_position"},
  {inputFile: "virtual_position.ts", inputClassName: "VirtualPosition", outputClassName: "zcl_alint_virtual_position", search: "METHODS equals IMPORTING p TYPE REF TO zcl_alint_position RETURNING VALUE(return) TYPE abap_bool.", replace: "METHODS equals REDEFINITION."},
  {inputFile: "abap/1_lexer/tokens/abstract_token.ts", inputClassName: "AbstractToken", outputClassName: "zcl_alint_abstract_token"},
  {inputFile: "abap/1_lexer/tokens/at.ts", inputClassName: "At", outputClassName: "zcl_alint_at"},
  {inputFile: "abap/1_lexer/tokens/wat.ts", inputClassName: "WAt", outputClassName: "zcl_alint_wat"},
  {inputFile: "abap/1_lexer/tokens/atw.ts", inputClassName: "AtW", outputClassName: "zcl_alint_atw"},
  {inputFile: "abap/1_lexer/tokens/watw.ts", inputClassName: "WAtW", outputClassName: "zcl_alint_watw"},
  {inputFile: "abap/1_lexer/tokens/bracket_left.ts", inputClassName: "BracketLeft", outputClassName: "zcl_alint_bracket_left"},
  {inputFile: "abap/1_lexer/tokens/wbracket_left.ts", inputClassName: "WBracketLeft", outputClassName: "zcl_alint_wbracket_left"},
  {inputFile: "abap/1_lexer/tokens/bracket_leftw.ts", inputClassName: "BracketLeftW", outputClassName: "zcl_alint_bracket_leftw"},
  {inputFile: "abap/1_lexer/tokens/wbracket_leftw.ts", inputClassName: "WBracketLeftW", outputClassName: "zcl_alint_wbracket_leftw"},
/*
  "abap/1_lexer/tokens/bracket_left.ts"
  "abap/1_lexer/tokens/bracket_right.ts"
  "abap/1_lexer/tokens/colon.ts"
  "abap/1_lexer/tokens/comment.ts"
  "abap/1_lexer/tokens/dash.ts"
  "abap/1_lexer/tokens/identifier.ts"
  "abap/1_lexer/tokens/instance_arrow.ts"
  "abap/1_lexer/tokens/paren_left.ts"
  "abap/1_lexer/tokens/paren_right.ts"
  "abap/1_lexer/tokens/plus.ts"
  "abap/1_lexer/tokens/pragma.ts"
  "abap/1_lexer/tokens/punctuation.ts"
  "abap/1_lexer/tokens/static_arrow.ts"
  "abap/1_lexer/tokens/string.ts"
*/
];

const nameMap: {[name: string]: string} = {};
for (const h of classes) {
  if (h.outputClassName.length > 30) {
    throw h.outputClassName + " longer than 30 characters";
  } else if (nameMap[h.inputClassName] !== undefined) {
    throw "duplicate name " + h.inputClassName ;
  }
  nameMap[h.inputClassName] = h.outputClassName;
  project.createSourceFile(h.inputFile, fs.readFileSync(INPUT_FOLDER + h.inputFile, "utf-8"));
}

diagnostics = project.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
} else {
  for (const h of classes) {
    const file = project.getSourceFile(path.basename(h.inputFile));
    let result = "";
    for (const s of file?.getStatements() || []) {
      result += handleStatement(s, {
        globalObjects: true,
        nameMap: nameMap,
      });
    }
    result = "* auto generated, do not touch\n" + result;
    if (h.search && h.replace) {
      result = result.replace(h.search, h.replace);
    }
    fs.writeFileSync(OUTPUT_FOLDER2 + h.outputClassName + ".clas.abap", result);
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>${h.outputClassName.toUpperCase()}</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>abaplint</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
  </asx:values>
 </asx:abap>
</abapGit>`;
    fs.writeFileSync(OUTPUT_FOLDER2 + h.outputClassName + ".clas.xml", xml);
  }
}