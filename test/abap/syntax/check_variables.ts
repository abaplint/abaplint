import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {CheckVariablesLogic} from "../../../src/abap/syntax/check_variables";
import {Issue} from "../../../src/issue";

function run(reg: Registry): Issue[] {
  let ret: Issue[] = [];
  for (const obj of reg.getABAPObjects()) {
    ret = ret.concat(new CheckVariablesLogic(reg, obj, "^(Z|Y)").findIssues(false));
  }
  return ret;
}

function runMulti(objects: {filename: string, contents: string}[]): Issue[] {
  const reg = new Registry();
  for (const obj of objects) {
    const file = new MemoryFile(obj.filename, obj.contents);
    reg.addFile(file).parse();
  }
  return run(reg);
}

function runClass(abap: string): Issue[] {
  const file = new MemoryFile("zcl_foobar.clas.abap", abap);
  const reg = new Registry().addFile(file).parse();
  return run(reg);
}

function runProgram(abap: string): Issue[] {
  const file = new MemoryFile("zfoobar.prog.abap", abap);
  const reg = new Registry().addFile(file).parse();
  return run(reg);
}

describe("Check Variables", () => {

  it("program, variable foobar not found", () => {
    const abap = "WRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("program, foobar found", () => {
    const abap = "DATA foobar.\nWRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, MESAGE", () => {
    const abap = "DATA foobar.\nMESSAGe e000(zz) WITH foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, constant", () => {
    const abap = "CONSTANTS foobar TYPE c VALUE 'B'.\nWRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, constant, begin", () => {
    const abap =
      "CONSTANTS: BEGIN OF c_mode,\n" +
      "             create TYPE i VALUE 1,\n" +
      "           END OF c_mode.\n" +
      "WRITE c_mode-create.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, foobar found, typed", () => {
    const abap = "DATA foobar TYPE c LENGTH 1.\nWRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, call method of global class", () => {
    const abap = "DATA field TYPE i.\nfield = zcl_global_class=>method( ).";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, SPLIT", () => {
    const abap = "DATA lt_foobar TYPE STANDARD TABLE OF string.\n" +
      "SPLIT 'sfsds' AT 's' INTO TABLE lt_foobar.";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, inline definition", () => {
    const abap = "DATA(foobar) = 2.\nWRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, variable foobar not found, target", () => {
    const abap = "foobar = 2.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("program, foobar found, target", () => {
    const abap = "DATA foobar.\nfoobar = 2.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, abap_true", () => {
    const abap = "WRITE abap_true.\nWRITE ABAP_TRUE.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, SET CURSOR", () => {
    const abap = "SET CURSOR FIELD 'P_PASS'.";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, sy field", () => {
    const abap = "WRITE sy-uname.\nWRITE SY-UNAME.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, TABLES", () => {
    const abap = "TABLES zmoo.\nWRITE zmoo.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, LOOP AT SCREEN", () => {
    const abap = "LOOP AT SCREEN.\nENDLOOP.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, parameter", () => {
    const abap = "PARAMETERS: p_moo TYPE i.\nWRITE p_moo.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, parameter", () => {
    const abap = "DATA: local TYPE i,\n" +
      "                 buffer TYPE c.\n" +
      "IMPORT name = local FROM DATA BUFFER buffer.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, SELECT-OPTIONS", () => {
// todo, this should really fail as structure-field is unknown
    const abap = "SELECT-OPTIONS foo FOR structure-field.\nWRITE foo.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, STATICS", () => {
    const abap = "FORM foo.\n" +
      "  STATICS: foo TYPE i.\n" +
      "  WRITE foo.\n" +
      "ENDFORM.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, line_exists", () => {
// todo, types of below code is not correct
    const abap = "DATA lt_data TYPE i.\n" +
      "IF line_exists( lt_data[ id = '2' ] ).\n" +
      "ENDIF.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, different scope", () => {
    const abap = "FORM foobar1.\n" +
      "  DATA moo.\n" +
      "ENDFORM.\n" +
      "FORM foobar2.\n" +
      "  WRITE moo.\n" +
      "ENDFORM.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"moo\" not found");
  });

  it("program, global scope", () => {
    const abap = "DATA moo.\n" +
      "FORM foo.\n" +
      "  WRITE moo.\n" +
      "ENDFORM.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, FORM parameter", () => {
    const abap = "FORM foo USING boo.\n" +
      "WRITE boo.\n" +
      "ENDFORM.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, offset", () => {
    const abap = "DATA lv_string TYPE string.\n" +
      "lv_string = lv_string+sy-fdpos.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, READ TABLE", () => {
// todo, this code is not syntactically correct
    const abap = "DATA lt_map TYPE STANDARD TABLE OF string.\n" +
      "DATA iv_tag TYPE string.\n" +
      "READ TABLE lt_map WITH KEY tag = iv_tag.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, component after call", () => {
// todo, this code is not syntactically correct
    const abap = "DATA field TYPE string.\n" +
      "field = get_something( )-date.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, definition in FOR expression", () => {
    const abap = "DATA itab TYPE STANDARD TABLE OF i.\n" +
      "itab = VALUE #( FOR j = 1 THEN j + 1 UNTIL j > 10 ( j ) ).";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

/*
  it("program, definition in FOR expression, should not work after", () => {
    const abap = "DATA itab TYPE STANDARD TABLE OF i.\n" +
      "itab = VALUE #( FOR j = 1 THEN j + 1 UNTIL j > 10 ( j ) ).\n" +
      "WRITE j.";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });
*/

  it("program, SELECT, database table not found, error", () => {
    const abap = "SELECT SINGLE * FROM zfoobar INTO @DATA(ls_data).";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("program, SELECT, database table not found, no error", () => {
    const abap = "SELECT SINGLE * FROM something INTO @DATA(ls_data).";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, component after call", () => {
    // todo, this code is not syntactically correct
    const abap = "run( zcl_global_class=>field ).\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, character offsets", () => {
    const abap = "DATA: lv_string TYPE string.\n" +
      "DATA: BEGIN OF ls_match,\n" +
      "        offset TYPE i,\n" +
      "        length TYPE i,\n" +
      "      END OF ls_match.\n" +
      "lv_string = lv_string+ls_match-offset(ls_match-length).\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, character offsets, field symbol", () => {
    const abap = "DATA: lv_string TYPE string.\n" +
      "DATA: BEGIN OF ls_match,\n" +
      "        offset TYPE i,\n" +
      "        length TYPE i,\n" +
      "      END OF ls_match.\n" +
      "FIELD-SYMBOLS: <ls_match> LIKE ls_match.\n" +
      "lv_string = lv_string+<ls_match>-offset(<ls_match>-length).\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, simple, no errors", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, variable foobar not found", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("class, foobar, local variable", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    DATA foobar.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, importing variable", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello IMPORTING foobar TYPE c.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, method not found, must push scope", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(2);
  });

  it("class, attribute", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    DATA foobar TYPE c.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, constant", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    CONSTANTS foobar TYPE c VALUE 'B'.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, constant, BEGIN OF", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    CONSTANTS: BEGIN OF foobar,\n" +
      "                 loo TYPE c VALUE 'B',\n" +
      "               END OF foobar.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar-loo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, changing parameter", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "  PRIVATE SECTION.\n" +
      "    METHODS moo CHANGING cv_changing TYPE i.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_FOOBAR IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    DATA lv_foo TYPE i.\n" +
      "    moo( CHANGING cv_changing = lv_foo ).\n" +
      "  ENDMETHOD.\n" +
      "  METHOD moo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, class-data, BEGIN OF", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    CLASS-DATA: BEGIN OF foobar,\n" +
      "                  loo TYPE c,\n" +
      "                END OF foobar.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar-loo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, me, method call", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PRIVATE SECTION.\n" +
      "    METHODS hello.\n" +
      "    METHODS world.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    me->world( ).\n" +
      "  ENDMETHOD.\n" +
      "  METHOD world.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, me", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PRIVATE SECTION.\n" +
      "    DATA foobar TYPE i.\n" +
      "    METHODS hello.\n" +
      "    METHODS world.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    me->world( ).\n" +
      "  ENDMETHOD.\n" +
      "  METHOD world.\n" +
      "    WRITE me->foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, private attribute", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PROTECTED SECTION.\n" +
      "    METHODS hello.\n" +
      "  PRIVATE SECTION.\n" +
      "    DATA foobar TYPE i.\n" +
      "    DATA bar TYPE i.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class implementing interface", () => {
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    INTERFACES zif_foobar .\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_FOOBAR IMPLEMENTATION.\n" +
      "  METHOD zif_foobar~method1.\n" +
      "    WRITE foo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const intf =
      "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1 IMPORTING foo TYPE i.\n" +
      "ENDINTERFACE.";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zif_foobar.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(0);
  });

  it("super class not found", () => {
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC INHERITING FROM zcl_super FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "ENDCLASS.\n";
    const issues = runClass(clas);
    expect(issues.length).to.equals(1);
  });

  it("protected attribute from super class", () => {
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC INHERITING FROM zcl_super FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const sup =
      "CLASS zcl_super DEFINITION PUBLIC CREATE PUBLIC.\n" +
      "  PROTECTED SECTION.\n" +
      "    DATA foobar TYPE i .\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zcl_super.clas.abap", contents: sup}]);
    expect(issues.length).to.equals(0);
  });

  it("super class not found, local variable found", () => {
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC INHERITING FROM zcl_super FINAL CREATE PUBLIC.\n" +
      "  PRIVATE SECTION.\n" +
      "    DATA foobar TYPE i.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    DATA foobar TYPE i.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const issues = runClass(clas);
    expect(issues.length).to.equals(1);
  });

  it("function module definition not found", () => {
    const code = "FUNCTION zagtest_function_module.\n" +
      "ENDFUNCTION.";

    const issues = runMulti([
      {filename: "zagtest_function_group.fugr.zagtest_function_module.abap", contents: code}]);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not found");
  });

  it("function module", () => {
    const xml =
      "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_FUGR\" serializer_version=\"v1.0.0\">\n" +
      " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
      "  <asx:values>\n" +
      "   <AREAT>test</AREAT>\n" +
      "   <INCLUDES>\n" +
      "    <SOBJ_NAME>LZAGTEST_FUNCTION_GROUPTOP</SOBJ_NAME>\n" +
      "    <SOBJ_NAME>SAPLZAGTEST_FUNCTION_GROUP</SOBJ_NAME>\n" +
      "   </INCLUDES>\n" +
      "   <FUNCTIONS>\n" +
      "    <item>\n" +
      "     <FUNCNAME>ZAGTEST_FUNCTION_MODULE</FUNCNAME>\n" +
      "     <SHORT_TEXT>test</SHORT_TEXT>\n" +
      "     <IMPORT>\n" +
      "      <RSIMP>\n" +
      "       <PARAMETER>IMPORT_PARAMETER</PARAMETER>\n" +
      "       <REFERENCE>X</REFERENCE>\n" +
      "       <TYP>C</TYP>\n" +
      "      </RSIMP>\n" +
      "     </IMPORT>\n" +
      "    </item>\n" +
      "   </FUNCTIONS>\n" +
      "  </asx:values>\n" +
      " </asx:abap>\n" +
      "</abapGit>";

    const code = "FUNCTION zagtest_function_module.\n" +
      "  WRITE import_parameter.\n" +
      "ENDFUNCTION.";

    const issues = runMulti([
      {filename: "zagtest_function_group.fugr.xml", contents: xml},
      {filename: "zagtest_function_group.fugr.zagtest_function_module.abap", contents: code}]);
    expect(issues.length).to.equals(0);
  });

  it("redefined method with parameter", () => {
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC INHERITING FROM zcl_super FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS method1 REDEFINITION.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD method1.\n" +
      "    WRITE parameter.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const sup =
      "CLASS zcl_super DEFINITION PUBLIC CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS method1 IMPORTING parameter TYPE c.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_SUPER IMPLEMENTATION.\n" +
      "  METHOD method1." +
      "  ENDMETHOD." +
      "ENDCLASS.";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zcl_super.clas.abap", contents: sup}]);
    expect(issues.length).to.equals(0);
  });

  it("redefined method with parameter, 2 steps up", () => {
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC INHERITING FROM zcl_super1 FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS method1 REDEFINITION.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD method1.\n" +
      "    WRITE parameter.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const sup1 =
      "CLASS zcl_super1 DEFINITION PUBLIC INHERITING FROM zcl_super2 CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_SUPER1 IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const sup2 =
      "CLASS zcl_super2 DEFINITION PUBLIC CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS method1 IMPORTING parameter TYPE c.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_SUPER2 IMPLEMENTATION.\n" +
      "  METHOD method1." +
      "  ENDMETHOD." +
      "ENDCLASS.";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zcl_super1.clas.abap", contents: sup1},
      {filename: "zcl_super2.clas.abap", contents: sup2}]);
    expect(issues.length).to.equals(0);
  });

  it("class implementing interface, referencing data from interface", () => {
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    INTERFACES zif_foobar2.\n" +
      "    METHODS bar.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_FOOBAR IMPLEMENTATION.\n" +
      "  METHOD bar.\n" +
      "    WRITE zif_foobar2~boo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const intf =
      "INTERFACE zif_foobar2 PUBLIC.\n" +
      "  DATA boo TYPE c LENGTH 1.\n" +
      "ENDINTERFACE.";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zif_foobar2.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(0);
  });

  it("CREATE DATA string", () => {
    const abap = "DATA foo TYPE c.\n" +
      "CREATE DATA foo TYPE string.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FILTER", () => {
    const abap = "DATA cells TYPE c.\n" +
      "DATA(result) = lines( FILTER #(\n" +
      "  cells USING KEY key_alive\n" +
      "  WHERE alive = abap_true ) ).\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

/*
  it("program, constant, begin, error", () => {
    const abap =
      "CONSTANTS: BEGIN OF c_mode,\n" +
      "             create TYPE i VALUE 1,\n" +
      "           END OF c_mode.\n" +
      "WRITE create.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });
*/

/*
  it("program, sy field, unknown field", () => {
    const abap = "WRITE sy-fooboo.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });
*/

// todo, static method cannot access instance attributes
// todo, can a private method acces protected attributes?
// todo, write protected fields

});