import * as fs from "fs";
import * as path from "node:path";
import {Project} from "ts-morph";
import {handleStatement} from "./statements";

const OUTPUT_FOLDER2 = "abap2/";
const INPUT_FOLDER = "../core/src/";

const project = new Project();

const inputFiles = [
  {inputFile: "position.ts", inputName: "Position", outputName: "zcl_alint_position"},
  {inputFile: "virtual_position.ts", inputName: "VirtualPosition", outputName: "zcl_alint_virtual_position"},
  {inputFile: "abap/1_lexer/tokens/abstract_token.ts", inputName: "AbstractToken", outputName: "zcl_alint_abstract_token"},
  {inputFile: "abap/1_lexer/tokens/at.ts", inputName: "At", outputName: "zcl_alint_at"},
  {inputFile: "abap/1_lexer/tokens/wat.ts", inputName: "WAt", outputName: "zcl_alint_wat"},
  {inputFile: "abap/1_lexer/tokens/atw.ts", inputName: "AtW", outputName: "zcl_alint_atw"},
  {inputFile: "abap/1_lexer/tokens/watw.ts", inputName: "WAtW", outputName: "zcl_alint_watw"},
  {inputFile: "abap/1_lexer/tokens/bracket_left.ts", inputName: "BracketLeft", outputName: "zcl_alint_bracket_left"},
  {inputFile: "abap/1_lexer/tokens/wbracket_left.ts", inputName: "WBracketLeft", outputName: "zcl_alint_wbracket_left"},
  {inputFile: "abap/1_lexer/tokens/bracket_leftw.ts", inputName: "BracketLeftW", outputName: "zcl_alint_bracket_leftw"},
  {inputFile: "abap/1_lexer/tokens/wbracket_leftw.ts", inputName: "WBracketLeftW", outputName: "zcl_alint_wbracket_leftw"},
  {inputFile: "abap/1_lexer/tokens/bracket_right.ts", inputName: "BracketRight", outputName: "zcl_alint_bracket_right"},
  {inputFile: "abap/1_lexer/tokens/wbracket_right.ts", inputName: "WBracketRight", outputName: "zcl_alint_wbracket_right"},
  {inputFile: "abap/1_lexer/tokens/bracket_rightw.ts", inputName: "BracketRightW", outputName: "zcl_alint_bracket_rightw"},
  {inputFile: "abap/1_lexer/tokens/wbracket_rightw.ts", inputName: "WBracketRightW", outputName: "zcl_alint_wbracket_rightw"},
  {inputFile: "abap/1_lexer/tokens/instance_arrow.ts", inputName: "InstanceArrow", outputName: "zcl_alint_instance_arrow"},
  {inputFile: "abap/1_lexer/tokens/winstance_arrow.ts", inputName: "WInstanceArrow", outputName: "zcl_alint_winstance_arrow"},
  {inputFile: "abap/1_lexer/tokens/instance_arroww.ts", inputName: "InstanceArrowW", outputName: "zcl_alint_instance_arroww"},
  {inputFile: "abap/1_lexer/tokens/winstance_arroww.ts", inputName: "WInstanceArrowW", outputName: "zcl_alint_winstance_arroww"},
  {inputFile: "abap/1_lexer/tokens/paren_left.ts", inputName: "ParenLeft", outputName: "zcl_alint_paren_left"},
  {inputFile: "abap/1_lexer/tokens/wparen_left.ts", inputName: "WParenLeft", outputName: "zcl_alint_wparen_left"},
  {inputFile: "abap/1_lexer/tokens/paren_leftw.ts", inputName: "ParenLeftW", outputName: "zcl_alint_paren_leftw"},
  {inputFile: "abap/1_lexer/tokens/wparen_leftw.ts", inputName: "WParenLeftW", outputName: "zcl_alint_wparen_leftw"},
  {inputFile: "abap/1_lexer/tokens/paren_right.ts", inputName: "ParenRight", outputName: "zcl_alint_paren_right"},
  {inputFile: "abap/1_lexer/tokens/wparen_right.ts", inputName: "WParenRight", outputName: "zcl_alint_wparen_right"},
  {inputFile: "abap/1_lexer/tokens/paren_rightw.ts", inputName: "ParenRightW", outputName: "zcl_alint_paren_rightw"},
  {inputFile: "abap/1_lexer/tokens/wparen_rightw.ts", inputName: "WParenRightW", outputName: "zcl_alint_wparen_rightw"},
  {inputFile: "abap/1_lexer/tokens/dash.ts", inputName: "Dash", outputName: "zcl_alint_dash"},
  {inputFile: "abap/1_lexer/tokens/wdash.ts", inputName: "WDash", outputName: "zcl_alint_wdash"},
  {inputFile: "abap/1_lexer/tokens/dashw.ts", inputName: "DashW", outputName: "zcl_alint_dashw"},
  {inputFile: "abap/1_lexer/tokens/wdashw.ts", inputName: "WDashW", outputName: "zcl_alint_wdashw"},
  {inputFile: "abap/1_lexer/tokens/plus.ts", inputName: "Plus", outputName: "zcl_alint_plus"},
  {inputFile: "abap/1_lexer/tokens/wplus.ts", inputName: "WPlus", outputName: "zcl_alint_wplus"},
  {inputFile: "abap/1_lexer/tokens/plusw.ts", inputName: "PlusW", outputName: "zcl_alint_plusw"},
  {inputFile: "abap/1_lexer/tokens/wplusw.ts", inputName: "WPlusW", outputName: "zcl_alint_wplusw"},
  {inputFile: "abap/1_lexer/tokens/static_arrow.ts", inputName: "StaticArrow", outputName: "zcl_alint_static_arrow"},
  {inputFile: "abap/1_lexer/tokens/wstatic_arrow.ts", inputName: "WStaticArrow", outputName: "zcl_alint_wstatic_arrow"},
  {inputFile: "abap/1_lexer/tokens/static_arroww.ts", inputName: "StaticArrowW", outputName: "zcl_alint_static_arroww"},
  {inputFile: "abap/1_lexer/tokens/wstatic_arroww.ts", inputName: "WStaticArrowW", outputName: "zcl_alint_wstatic_arroww"},
  {inputFile: "abap/1_lexer/tokens/string.ts", inputName: "StringToken", outputName: "zcl_alint_string_token"},
  {inputFile: "abap/1_lexer/tokens/string_template.ts", inputName: "StringTemplate", outputName: "zcl_alint_string_template"},
  {inputFile: "abap/1_lexer/tokens/string_template_begin.ts", inputName: "StringTemplateBegin", outputName: "zcl_alint_string_template_begi"},
  {inputFile: "abap/1_lexer/tokens/string_template_end.ts", inputName: "StringTemplateEnd", outputName: "zcl_alint_string_template_end"},
  {inputFile: "abap/1_lexer/tokens/string_template_middle.ts", inputName: "StringTemplateMiddle", outputName: "zcl_alint_string_template_midd"},
  {inputFile: "abap/1_lexer/tokens/colon.ts", inputName: "Colon", outputName: "zcl_alint_colon"},
  {inputFile: "abap/1_lexer/tokens/comment.ts", inputName: "Comment", outputName: "zcl_alint_comment"},
  {inputFile: "abap/1_lexer/tokens/identifier.ts", inputName: "Identifier", outputName: "zcl_alint_identifier"},
  {inputFile: "abap/1_lexer/tokens/pragma.ts", inputName: "Pragma", outputName: "zcl_alint_pragma"},
  {inputFile: "abap/1_lexer/tokens/punctuation.ts", inputName: "Punctuation", outputName: "zcl_alint_punctuation"},
  {inputFile: "abap/1_lexer/tokens/index.ts", inputName: "", outputName: ""},
  {inputFile: "files/_ifile.ts", inputName: "IFile", outputName: "zif_alint_ifile"},
  {inputFile: "files/_abstract_file.ts", inputName: "AbstractFile", outputName: "zcl_alint_abstract_file"},
  {inputFile: "files/memory_file.ts", inputName: "MemoryFile", outputName: "zcl_alint_memory_file"},
  {inputFile: "abap/1_lexer/lexer_buffer.ts", inputName: "LexerBuffer", outputName: "zcl_alint_lexer_stream"},
  {inputFile: "abap/1_lexer/lexer_stream.ts", inputName: "LexerStream", outputName: "zcl_alint_lexer_buffer"},
  {inputFile: "abap/1_lexer/lexer_result.ts", inputName: "", outputName: ""},
  {inputFile: "abap/1_lexer/lexer.ts", inputName: "Lexer", outputName: "zcl_alint_lexer"},
];

const nameMap: {[name: string]: string} = {};
for (const h of inputFiles) {
  if (h.outputName.length > 30) {
    throw h.outputName + " longer than 30 characters";
  } else if (nameMap[h.inputName] !== undefined) {
    throw new Error("duplicate name " + h.inputName);
  }

  if (h.inputName !== "") {
    nameMap[h.inputName.toUpperCase()] = h.outputName;
  }

  project.createSourceFile(h.inputFile, fs.readFileSync(INPUT_FOLDER + h.inputFile, "utf-8"));
}

const diagnostics = project.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
  process.exit(-1);
} else {
  const config = {
    globalObjects: true,
    ddicName: "zif_alint_ddic",
    nameMap: nameMap,
  };

  let ddic = "INTERFACE " + config.ddicName + " PUBLIC.\n";
  let extension = "";
  for (const h of inputFiles) {
    const file = project.getSourceFile(path.basename(h.inputFile));
    let result = "";
    for (const s of file?.getStatements() || []) {
      if (h.outputName === "") {
        // then its DDIC
        ddic += handleStatement(s, config);
      } else {
        result += handleStatement(s, config);
      }
    }

    result = "* auto generated, do not touch\n" + result;

    extension = ".clas";
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
    saveXML(h.outputName, extension);
  }

  extension = ".intf";
  ddic += "ENDINTERFACE.\n";
  fs.writeFileSync(OUTPUT_FOLDER2 + config.ddicName + extension + ".abap", ddic);
  saveXML(config.ddicName, extension);
}


function saveXML(outputName: string, extension: string) {
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>${outputName.toUpperCase()}</CLSNAME>
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
    <CLSNAME>${outputName.toUpperCase()}</CLSNAME>
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
  fs.writeFileSync(OUTPUT_FOLDER2 + outputName + extension + ".xml", byteOrderMark + xml + "\n");
}