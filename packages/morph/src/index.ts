import * as fs from "fs";
import * as path from "node:path";
import {Project} from "ts-morph";
import {handleStatement} from "./statements";

const OUTPUT_FOLDER2 = "abap2/";
const INPUT_FOLDER = "../core/src/";

const project = new Project();

const inputFiles = [
  {inputFile: "position.ts", inputClassName: "Position", outputName: "zcl_alint_position"},
  {inputFile: "virtual_position.ts", inputClassName: "VirtualPosition", outputName: "zcl_alint_virtual_position"},
  {inputFile: "abap/1_lexer/tokens/abstract_token.ts", inputClassName: "AbstractToken", outputName: "zcl_alint_abstract_token"},
  {inputFile: "abap/1_lexer/tokens/at.ts", inputClassName: "At", outputName: "zcl_alint_at"},
  {inputFile: "abap/1_lexer/tokens/wat.ts", inputClassName: "WAt", outputName: "zcl_alint_wat"},
  {inputFile: "abap/1_lexer/tokens/atw.ts", inputClassName: "AtW", outputName: "zcl_alint_atw"},
  {inputFile: "abap/1_lexer/tokens/watw.ts", inputClassName: "WAtW", outputName: "zcl_alint_watw"},
  {inputFile: "abap/1_lexer/tokens/bracket_left.ts", inputClassName: "BracketLeft", outputName: "zcl_alint_bracket_left"},
  {inputFile: "abap/1_lexer/tokens/wbracket_left.ts", inputClassName: "WBracketLeft", outputName: "zcl_alint_wbracket_left"},
  {inputFile: "abap/1_lexer/tokens/bracket_leftw.ts", inputClassName: "BracketLeftW", outputName: "zcl_alint_bracket_leftw"},
  {inputFile: "abap/1_lexer/tokens/wbracket_leftw.ts", inputClassName: "WBracketLeftW", outputName: "zcl_alint_wbracket_leftw"},
  {inputFile: "abap/1_lexer/tokens/bracket_right.ts", inputClassName: "BracketRight", outputName: "zcl_alint_bracket_right"},
  {inputFile: "abap/1_lexer/tokens/wbracket_right.ts", inputClassName: "WBracketRight", outputName: "zcl_alint_wbracket_right"},
  {inputFile: "abap/1_lexer/tokens/bracket_rightw.ts", inputClassName: "BracketRightW", outputName: "zcl_alint_bracket_rightw"},
  {inputFile: "abap/1_lexer/tokens/wbracket_rightw.ts", inputClassName: "WBracketRightW", outputName: "zcl_alint_wbracket_rightw"},
  {inputFile: "abap/1_lexer/tokens/instance_arrow.ts", inputClassName: "InstanceArrow", outputName: "zcl_alint_instance_arrow"},
  {inputFile: "abap/1_lexer/tokens/winstance_arrow.ts", inputClassName: "WInstanceArrow", outputName: "zcl_alint_winstance_arrow"},
  {inputFile: "abap/1_lexer/tokens/instance_arroww.ts", inputClassName: "InstanceArrowW", outputName: "zcl_alint_instance_arroww"},
  {inputFile: "abap/1_lexer/tokens/winstance_arroww.ts", inputClassName: "WInstanceArrowW", outputName: "zcl_alint_winstance_arroww"},
  {inputFile: "abap/1_lexer/tokens/paren_left.ts", inputClassName: "ParenLeft", outputName: "zcl_alint_paren_left"},
  {inputFile: "abap/1_lexer/tokens/wparen_left.ts", inputClassName: "WParenLeft", outputName: "zcl_alint_wparen_left"},
  {inputFile: "abap/1_lexer/tokens/paren_leftw.ts", inputClassName: "ParenLeftW", outputName: "zcl_alint_paren_leftw"},
  {inputFile: "abap/1_lexer/tokens/wparen_leftw.ts", inputClassName: "WParenLeftW", outputName: "zcl_alint_wparen_leftw"},
  {inputFile: "abap/1_lexer/tokens/paren_right.ts", inputClassName: "ParenRight", outputName: "zcl_alint_paren_right"},
  {inputFile: "abap/1_lexer/tokens/wparen_right.ts", inputClassName: "WParenRight", outputName: "zcl_alint_wparen_right"},
  {inputFile: "abap/1_lexer/tokens/paren_rightw.ts", inputClassName: "ParenRightW", outputName: "zcl_alint_paren_rightw"},
  {inputFile: "abap/1_lexer/tokens/wparen_rightw.ts", inputClassName: "WParenRightW", outputName: "zcl_alint_wparen_rightw"},
  {inputFile: "abap/1_lexer/tokens/dash.ts", inputClassName: "Dash", outputName: "zcl_alint_dash"},
  {inputFile: "abap/1_lexer/tokens/wdash.ts", inputClassName: "WDash", outputName: "zcl_alint_wdash"},
  {inputFile: "abap/1_lexer/tokens/dashw.ts", inputClassName: "DashW", outputName: "zcl_alint_dashw"},
  {inputFile: "abap/1_lexer/tokens/wdashw.ts", inputClassName: "WDashW", outputName: "zcl_alint_wdashw"},
  {inputFile: "abap/1_lexer/tokens/plus.ts", inputClassName: "Plus", outputName: "zcl_alint_plus"},
  {inputFile: "abap/1_lexer/tokens/wplus.ts", inputClassName: "WPlus", outputName: "zcl_alint_wplus"},
  {inputFile: "abap/1_lexer/tokens/plusw.ts", inputClassName: "PlusW", outputName: "zcl_alint_plusw"},
  {inputFile: "abap/1_lexer/tokens/wplusw.ts", inputClassName: "WPlusW", outputName: "zcl_alint_wplusw"},
  {inputFile: "abap/1_lexer/tokens/static_arrow.ts", inputClassName: "StaticArrow", outputName: "zcl_alint_static_arrow"},
  {inputFile: "abap/1_lexer/tokens/wstatic_arrow.ts", inputClassName: "WStaticArrow", outputName: "zcl_alint_wstatic_arrow"},
  {inputFile: "abap/1_lexer/tokens/static_arroww.ts", inputClassName: "StaticArrowW", outputName: "zcl_alint_static_arroww"},
  {inputFile: "abap/1_lexer/tokens/wstatic_arroww.ts", inputClassName: "WStaticArrowW", outputName: "zcl_alint_wstatic_arroww"},
  {inputFile: "abap/1_lexer/tokens/string.ts", inputClassName: "StringToken", outputName: "zcl_alint_string_token"},
  {inputFile: "abap/1_lexer/tokens/string_template.ts", inputClassName: "StringTemplate", outputName: "zcl_alint_string_template"},
  {inputFile: "abap/1_lexer/tokens/string_template_begin.ts", inputClassName: "StringTemplateBegin", outputName: "zcl_alint_string_template_begi"},
  {inputFile: "abap/1_lexer/tokens/string_template_end.ts", inputClassName: "StringTemplateEnd", outputName: "zcl_alint_string_template_end"},
  {inputFile: "abap/1_lexer/tokens/string_template_middle.ts", inputClassName: "StringTemplateMiddle", outputName: "zcl_alint_string_template_midd"},
  {inputFile: "abap/1_lexer/tokens/colon.ts", inputClassName: "Colon", outputName: "zcl_alint_colon"},
  {inputFile: "abap/1_lexer/tokens/comment.ts", inputClassName: "Comment", outputName: "zcl_alint_comment"},
  {inputFile: "abap/1_lexer/tokens/identifier.ts", inputClassName: "Identifier", outputName: "zcl_alint_identifier"},
  {inputFile: "abap/1_lexer/tokens/pragma.ts", inputClassName: "Pragma", outputName: "zcl_alint_pragma"},
  {inputFile: "abap/1_lexer/tokens/punctuation.ts", inputClassName: "Punctuation", outputName: "zcl_alint_punctuation"},
  {inputFile: "abap/1_lexer/tokens/index.ts", inputClassName: "", outputName: ""},
  {inputFile: "files/_ifile.ts", inputClassName: "IFile", outputName: "zif_alint_ifile"},
  {inputFile: "files/_abstract_file.ts", inputClassName: "AbstractFile", outputName: "zcl_alint_abstract_file"},
  {inputFile: "files/memory_file.ts", inputClassName: "MemoryFile", outputName: "zcl_alint_memory_file"},
  {inputFile: "abap/1_lexer/lexer_buffer.ts", inputClassName: "LexerBuffer", outputName: "zcl_alint_lexer_stream"},
  {inputFile: "abap/1_lexer/lexer_stream.ts", inputClassName: "LexerStream", outputName: "zcl_alint_lexer_buffer"},
  /*
  {inputFile: "abap/1_lexer/lexer_result.ts", inputClassName: "", outputName: ""},
  {inputFile: "abap/1_lexer/lexer.ts", inputClassName: "Lexer", outputName: "zcl_alint_lexer"},
  */
];

const nameMap: {[name: string]: string} = {};
for (const h of inputFiles) {
  if (h.outputName.length > 30) {
    throw h.outputName + " longer than 30 characters";
  } else if (nameMap[h.inputClassName] !== undefined) {
    throw new Error("duplicate name " + h.inputClassName);
  }

  if (h.inputClassName !== "") {
    nameMap[h.inputClassName.toUpperCase()] = h.outputName;
  }

  project.createSourceFile(h.inputFile, fs.readFileSync(INPUT_FOLDER + h.inputFile, "utf-8"));
}

const diagnostics = project.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
  process.exit(-1);
} else {
  for (const h of inputFiles) {
    if (h.outputName === "") {
      continue;
    }

    const file = project.getSourceFile(path.basename(h.inputFile));
    let result = "";
    for (const s of file?.getStatements() || []) {
      result += handleStatement(s, {
        globalObjects: true,
        nameMap: nameMap,
      });
    }

    result = "* auto generated, do not touch\n" + result;

    let extension = ".clas";
    if (result.includes("ENDINTERFACE.")) {
      extension = ".intf";
    }

    // workarounds
    if (h.outputName === "zcl_alint_memory_file") {
      result = result.replace(/METHODS getraw RETURNING VALUE\(return\) TYPE string./i,
                              "METHODS getraw REDEFINITION.");
      result = result.replace(/METHODS getrawrows RETURNING VALUE\(return\) TYPE string_table./i,
                              "METHODS getrawrows REDEFINITION.");
    } else if (h.outputName === "zcl_alint_virtual_position") {
      result = result.replace(/METHODS equals IMPORTING p TYPE REF TO zcl_alint_position RETURNING VALUE\(return\) TYPE abap_bool./i,
                              "METHODS equals REDEFINITION.");
    }

    fs.writeFileSync(OUTPUT_FOLDER2 + h.outputName + extension + ".abap", result);

    let xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>${h.outputName.toUpperCase()}</CLSNAME>
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
    <CLSNAME>${h.outputName.toUpperCase()}</CLSNAME>
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
    const byteOrderMark = Buffer.from("EFBBBF", "hex").toString();
    fs.writeFileSync(OUTPUT_FOLDER2 + h.outputName + extension + ".xml", byteOrderMark + xml + "\n");
  }
}