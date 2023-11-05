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
  {inputFile: "abap/1_lexer/tokens/bracket_right.ts", inputClassName: "BracketRight", outputClassName: "zcl_alint_bracket_right"},
  {inputFile: "abap/1_lexer/tokens/wbracket_right.ts", inputClassName: "WBracketRight", outputClassName: "zcl_alint_wbracket_right"},
  {inputFile: "abap/1_lexer/tokens/bracket_rightw.ts", inputClassName: "BracketRightW", outputClassName: "zcl_alint_bracket_rightw"},
  {inputFile: "abap/1_lexer/tokens/wbracket_rightw.ts", inputClassName: "WBracketRightW", outputClassName: "zcl_alint_wbracket_rightw"},
  {inputFile: "abap/1_lexer/tokens/instance_arrow.ts", inputClassName: "InstanceArrow", outputClassName: "zcl_alint_instance_arrow"},
  {inputFile: "abap/1_lexer/tokens/winstance_arrow.ts", inputClassName: "WInstanceArrow", outputClassName: "zcl_alint_winstance_arrow"},
  {inputFile: "abap/1_lexer/tokens/instance_arroww.ts", inputClassName: "InstanceArrowW", outputClassName: "zcl_alint_instance_arroww"},
  {inputFile: "abap/1_lexer/tokens/winstance_arroww.ts", inputClassName: "WInstanceArrowW", outputClassName: "zcl_alint_winstance_arroww"},
  {inputFile: "abap/1_lexer/tokens/paren_left.ts", inputClassName: "ParenLeft", outputClassName: "zcl_alint_paren_left"},
  {inputFile: "abap/1_lexer/tokens/wparen_left.ts", inputClassName: "WParenLeft", outputClassName: "zcl_alint_wparen_left"},
  {inputFile: "abap/1_lexer/tokens/paren_leftw.ts", inputClassName: "ParenLeftW", outputClassName: "zcl_alint_paren_leftw"},
  {inputFile: "abap/1_lexer/tokens/wparen_leftw.ts", inputClassName: "WParenLeftW", outputClassName: "zcl_alint_wparen_leftw"},
  {inputFile: "abap/1_lexer/tokens/paren_right.ts", inputClassName: "ParenRight", outputClassName: "zcl_alint_paren_right"},
  {inputFile: "abap/1_lexer/tokens/wparen_right.ts", inputClassName: "WParenRight", outputClassName: "zcl_alint_wparen_right"},
  {inputFile: "abap/1_lexer/tokens/paren_rightw.ts", inputClassName: "ParenRightW", outputClassName: "zcl_alint_paren_rightw"},
  {inputFile: "abap/1_lexer/tokens/wparen_rightw.ts", inputClassName: "WParenRightW", outputClassName: "zcl_alint_wparen_rightw"},
  {inputFile: "abap/1_lexer/tokens/dash.ts", inputClassName: "Dash", outputClassName: "zcl_alint_dash"},
  {inputFile: "abap/1_lexer/tokens/wdash.ts", inputClassName: "WDash", outputClassName: "zcl_alint_wdash"},
  {inputFile: "abap/1_lexer/tokens/dashw.ts", inputClassName: "DashW", outputClassName: "zcl_alint_dashw"},
  {inputFile: "abap/1_lexer/tokens/wdashw.ts", inputClassName: "WDashW", outputClassName: "zcl_alint_wdashw"},
  {inputFile: "abap/1_lexer/tokens/plus.ts", inputClassName: "Plus", outputClassName: "zcl_alint_plus"},
  {inputFile: "abap/1_lexer/tokens/wplus.ts", inputClassName: "WPlus", outputClassName: "zcl_alint_wplus"},
  {inputFile: "abap/1_lexer/tokens/plusw.ts", inputClassName: "PlusW", outputClassName: "zcl_alint_plusw"},
  {inputFile: "abap/1_lexer/tokens/wplusw.ts", inputClassName: "WPlusW", outputClassName: "zcl_alint_wplusw"},
  {inputFile: "abap/1_lexer/tokens/static_arrow.ts", inputClassName: "StaticArrow", outputClassName: "zcl_alint_static_arrow"},
  {inputFile: "abap/1_lexer/tokens/wstatic_arrow.ts", inputClassName: "WStaticArrow", outputClassName: "zcl_alint_wstatic_arrow"},
  {inputFile: "abap/1_lexer/tokens/static_arroww.ts", inputClassName: "StaticArrowW", outputClassName: "zcl_alint_static_arroww"},
  {inputFile: "abap/1_lexer/tokens/wstatic_arroww.ts", inputClassName: "WStaticArrowW", outputClassName: "zcl_alint_wstatic_arroww"},
  {inputFile: "abap/1_lexer/tokens/string.ts", inputClassName: "StringToken", outputClassName: "zcl_alint_string_token"},
  {inputFile: "abap/1_lexer/tokens/string_template.ts", inputClassName: "StringTemplate", outputClassName: "zcl_alint_string_template"},
  {inputFile: "abap/1_lexer/tokens/string_template_begin.ts", inputClassName: "StringTemplateBegin", outputClassName: "zcl_alint_string_template_begi"},
  {inputFile: "abap/1_lexer/tokens/string_template_end.ts", inputClassName: "StringTemplateEnd", outputClassName: "zcl_alint_string_template_end"},
  {inputFile: "abap/1_lexer/tokens/string_template_middle.ts", inputClassName: "StringTemplateMiddle", outputClassName: "zcl_alint_string_template_midd"},
  {inputFile: "abap/1_lexer/tokens/colon.ts", inputClassName: "Colon", outputClassName: "zcl_alint_colon"},
  {inputFile: "abap/1_lexer/tokens/comment.ts", inputClassName: "Comment", outputClassName: "zcl_alint_comment"},
  {inputFile: "abap/1_lexer/tokens/identifier.ts", inputClassName: "Identifier", outputClassName: "zcl_alint_identifier"},
  {inputFile: "abap/1_lexer/tokens/pragma.ts", inputClassName: "Pragma", outputClassName: "zcl_alint_pragma"},
  {inputFile: "abap/1_lexer/tokens/punctuation.ts", inputClassName: "Punctuation", outputClassName: "zcl_alint_punctuation"},
  {inputFile: "files/_ifile.ts", inputClassName: "IFile", outputClassName: "zif_alint_ifile"},
  {inputFile: "files/_abstract_file.ts", inputClassName: "AbstractFile", outputClassName: "zcl_alint_abstract_file"},
  {inputFile: "files/memory_file.ts", inputClassName: "MemoryFile", outputClassName: "zcl_alint_memory_file"},
];

const nameMap: {[name: string]: string} = {};
for (const h of classes) {
  if (h.outputClassName.length > 30) {
    throw h.outputClassName + " longer than 30 characters";
  } else if (nameMap[h.inputClassName] !== undefined) {
    throw new Error("duplicate name " + h.inputClassName);
  }
  nameMap[h.inputClassName.toUpperCase()] = h.outputClassName;
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

    let extension = ".clas";
    if (result.includes("ENDINTERFACE.")) {
      extension = ".intf";
    }
    fs.writeFileSync(OUTPUT_FOLDER2 + h.outputClassName + extension + ".abap", result);

    let xml = `<?xml version="1.0" encoding="utf-8"?>
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
    if (extension === ".intf") {
      xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_INTF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOINTERF>
    <CLSNAME>${h.outputClassName.toUpperCase()}</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>abaplint</DESCRIPT>
    <EXPOSURE>2</EXPOSURE>
    <STATE>1</STATE>
    <UNICODE>X</UNICODE>
   </VSEOINTERF>
  </asx:values>
 </asx:abap>
</abapGit>`;
    }
    const bom = Buffer.from("EFBBBF", "hex").toString();
    fs.writeFileSync(OUTPUT_FOLDER2 + h.outputClassName + extension + ".xml", bom + xml);
  }
}