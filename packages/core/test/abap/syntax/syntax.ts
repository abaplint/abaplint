import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {Issue} from "../../../src/issue";
import {Config} from "../../../src/config";
import {IRegistry} from "../../../src/_iregistry";
import {getABAPObjects} from "../../get_abap";
import {Version} from "../../../src/version";

function run(reg: IRegistry, globalConstants?: string[], version?: Version): Issue[] {
  let ret: Issue[] = [];

  const config = reg.getConfig().get();
  if (globalConstants) {
    config.syntax.globalConstants = globalConstants;
  }
  if (version) {
    config.syntax.version = version;
  }
  reg.setConfig(new Config(JSON.stringify(config)));
  reg.parse();

  for (const obj of getABAPObjects(reg)) {
    for (const file of obj.getABAPFiles()) {
      if (file.getStructure() === undefined) {
        throw new Error("check variables test, parser error");
      }
    }
    ret = ret.concat(new SyntaxLogic(reg, obj).run().issues);
  }
  return ret;
}

function runMulti(objects: {filename: string, contents: string}[]): Issue[] {
  const reg = new Registry();
  for (const obj of objects) {
    const file = new MemoryFile(obj.filename, obj.contents);
    reg.addFile(file);
  }
  return run(reg);
}

function runClass(abap: string): Issue[] {
  const file = new MemoryFile("zcl_foobar.clas.abap", abap);
  const reg = new Registry().addFile(file);
  return run(reg);
}

function runProgram(abap: string, globalConstants?: string[], version?: Version): Issue[] {
  const file = new MemoryFile("zfoobar.prog.abap", abap);
  const reg: IRegistry = new Registry().addFile(file);
  return run(reg, globalConstants, version);
}

////////////////////////////////////////////////////////////

describe("syntax.ts, Check Variables", () => {

  it("program, variable foobar not found", () => {
    const abap = "WRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("foobar");
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

  it("program, call method of global class, class not found", () => {
    const abap = `
DATA field TYPE i.
field = zcl_global_class=>method( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
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
    expect(issues[0].getMessage()).to.contain("\"foobar\" not found");
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

  it("program, STATICS", () => {
    const abap = "FORM foo.\n" +
      "  STATICS: foo TYPE i.\n" +
      "  WRITE foo.\n" +
      "ENDFORM.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, line_exists", () => {
    const abap = "DATA lt_data TYPE i.\n" +
      "IF line_exists( lt_data[ id = '2' ] ).\n" +
      "ENDIF.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
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
    expect(issues[0].getMessage()).to.contain("moo");
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

  it("program, class definition not found", () => {
    const abap = "CLASS lcl_foobar IMPLEMENTATION.\n" +
      "ENDCLASS.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("program, class definition not found, two methods should give single error", () => {
    const abap = "CLASS lcl_foobar IMPLEMENTATION.\n" +
      "  METHOD moo.\n" +
      "  ENDMETHOD.\n" +
      "  METHOD bar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("locals impl, class definition, one method", () => {
    const def = "CLASS lcl_foobar DEFINITION.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS: hello IMPORTING moo TYPE string.\n" +
      "ENDCLASS.\n";
    const impl = "CLASS lcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE moo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const issues = runMulti([
      {filename: "zcl_sdfsdf.clas.locals_def.abap", contents: def},
      {filename: "zcl_sdfsdf.clas.locals_imp.abap", contents: impl}]);
    expect(issues.length).to.equals(0);
  });

  it("locals impl, error descriptions, double error", () => {
    const def =
      "CLASS lcl_foobar DEFINITION.\n" +
      "  PUBLIC SECTION.\n" +
      "ENDCLASS.\n";
    const impl = "CLASS lcl_foobar IMPLEMENTATION.\n" +
      "  METHOD method1.\n" +
      "  ENDMETHOD.\n" +
      "  METHOD method2.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const issues = runMulti([
      {filename: "zcl_sdfsdf.clas.locals_def.abap", contents: def},
      {filename: "zcl_sdfsdf.clas.locals_imp.abap", contents: impl}]);
    expect(issues.length).to.equals(2);
    expect(issues[0].getMessage()).to.contain("method1");
    expect(issues[1].getMessage()).to.contain("method2");
  });

  it("locals impl, interface", () => {
    const def = "INTERFACE lif_foobar.\n" +
      "  METHODS: moo.\n" +
      "ENDINTERFACE.\n" +
      "CLASS lcl_foobar DEFINITION.\n" +
      "  PUBLIC SECTION.\n" +
      "    INTERFACES lif_foobar.\n" +
      "ENDCLASS.\n";
    const impl = "CLASS lcl_foobar IMPLEMENTATION.\n" +
      "  METHOD lif_foobar~moo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const issues = runMulti([
      {filename: "zcl_sdfsdf.clas.locals_def.abap", contents: def},
      {filename: "zcl_sdfsdf.clas.locals_imp.abap", contents: impl}]);
    expect(issues.length).to.equals(0);
  });

  it("program, local superclass not found", () => {
    const abap =
      "CLASS lcl_class DEFINITION INHERITING FROM lcl_base.\n" +
      "ENDCLASS.\n" +
      "CLASS lcl_class IMPLEMENTATION.\n" +
      "ENDCLASS.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("program, local superclass found", () => {
    const abap =
      "CLASS lcl_base DEFINITION.\n" +
      "ENDCLASS.\n" +
      "CLASS lcl_base IMPLEMENTATION.\n" +
      "ENDCLASS.\n" +
      "CLASS lcl_class DEFINITION INHERITING FROM lcl_base.\n" +
      "ENDCLASS.\n" +
      "CLASS lcl_class IMPLEMENTATION.\n" +
      "ENDCLASS.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, READ TABLE", () => {
// todo, this code is not syntactically correct
    const abap = `DATA lt_map TYPE STANDARD TABLE OF string.
      DATA iv_tag TYPE string.
      READ TABLE lt_map WITH KEY tag = iv_tag.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, component after call 1, expect error", () => {
    const abap = "DATA field TYPE string.\n" +
      "field = get_something( )-date.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("program, definition in FOR expression", () => {
    const abap = `DATA itab TYPE STANDARD TABLE OF i.
      itab = VALUE #( FOR j = 1 THEN j + 1 UNTIL j > 10 ( j ) ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, SELECT, INTO field not found", () => {
    const abap = "SELECT SINGLE field FROM foobar INTO lv_field.";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

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

  it("program, SELECT, aliased field, no error expected", () => {
    const abap = "SELECT SINGLE field FROM dbtable INTO @DATA(lv_data) WHERE field = dbtable~field.";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, SELECT, database table not found, no error, with WHERE", () => {
    const abap = `DATA loo TYPE string.
    SELECT SINGLE * FROM something INTO @DATA(ls_data) WHERE moo = loo.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, component after call 2", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS: run IMPORTING foo TYPE i.
    CLASS-DATA: field TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD run.
    run( lcl_bar=>field ).
  ENDMETHOD.
ENDCLASS.
    `;
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

  it("class, simple, one error for method not found", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD helllloooo.\n" +
      "    WRITE moo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(1);
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
    expect(issues[0].getMessage()).to.contain("foobar");
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
    expect(issues.length).to.equals(1);
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
    const abap = `
      CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PRIVATE SECTION.
          METHODS hello.
          METHODS world.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
        METHOD hello.
          me->world( ).
        ENDMETHOD.
        METHOD world.
        ENDMETHOD.
      ENDCLASS.`;
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
    const sup = `
      CLASS zcl_super DEFINITION PUBLIC CREATE PUBLIC.
        PROTECTED SECTION.
          DATA foobar TYPE i.
      ENDCLASS.
      CLASS ZCL_SUPER IMPLEMENTATION.
      ENDCLASS.`;
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

  // skipped for now, the object is inconsistent, missing main ABAP file
  it.skip("function module definition not found", () => {
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

  it("FORMAT INTENSIFIED OFF.", () => {
    const abap = "FORMAT INTENSIFIED OFF.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FILTER", () => {
    const abap = `
TYPES: BEGIN OF ty_bar,
         alive TYPE abap_bool,
       END OF ty_bar.
DATA cells TYPE STANDARD TABLE OF ty_bar WITH NON-UNIQUE SORTED KEY key_alive COMPONENTS alive.
DATA(result) = lines( FILTER #( cells USING KEY key_alive WHERE alive = abap_true ) ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("value from ENUM, procedural", () => {
    const abap = "  TYPES:\n" +
      "    BEGIN OF ENUM enum_name,\n" +
      "      value1,\n" +
      "    END OF ENUM enum_name.\n" +
      "  DATA var_name TYPE enum_name.\n" +
      "  var_name = value1.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("value from ENUM, object oriented", () => {
    const abap = "CLASS lcl_foo DEFINITION.\n" +
      "  PUBLIC SECTION.\n" +
      "    TYPES:\n" +
      "      BEGIN OF ENUM enum_name,\n" +
      "        value1,\n" +
      "      END OF ENUM enum_name.\n" +
      "    METHODS: moo.\n" +
      "ENDCLASS.\n" +
      "CLASS lcl_foo IMPLEMENTATION.\n" +
      "  METHOD moo.\n" +
      "    WRITE value1.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("event handler parameter", () => {
    const abap = "CLASS zcl_moo DEFINITION CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS double_click\n" +
      "      FOR EVENT double_click OF cl_salv_events_table\n" +
      "      IMPORTING !row !column.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "  METHOD double_click.\n" +
      "    WRITE row.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, global constant", () => {
    const abap = "WRITE hello_world.\n";
    const issues = runProgram(abap, ["hello_world"]);
    expect(issues.length).to.equals(0);
  });

  it("class implementing interface, aliased implementation", () => {
    const intf =
      "INTERFACE zif_foobar2 PUBLIC.\n" +
      "  METHODS method1 IMPORTING foo TYPE i.\n" +
      "ENDINTERFACE.";
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    INTERFACES zif_foobar2.\n" +
      "    ALIASES method1 FOR zif_foobar2~method1.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_FOOBAR IMPLEMENTATION.\n" +
      "  METHOD method1.\n" +
      "    WRITE foo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zif_foobar2.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(0);
  });

  it("class implementing interface, aliased attribute", () => {
    const intf =
      "INTERFACE zif_foobar2 PUBLIC.\n" +
      "  DATA: bar TYPE string.\n" +
      "  METHODS method1.\n" +
      "ENDINTERFACE.";
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    INTERFACES zif_foobar2.\n" +
      "    ALIASES foo FOR zif_foobar2~bar.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_FOOBAR IMPLEMENTATION.\n" +
      "  METHOD zif_foobar2~method1.\n" +
      "    WRITE foo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zif_foobar2.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(0);
  });

  it("COND with LET, inline", () => {
    const abap = "DATA(x) = COND abap_bool( LET helper = '1' IN\n" +
      "  WHEN helper = '0'\n" +
      "  THEN abap_true ELSE abap_false ).\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("REDUCE with INIT", () => {
    const abap = `
DATA it_result TYPE STANDARD TABLE OF string.
DATA(output) = REDUCE string( INIT result = ||
  FOR <result> IN it_result
  NEXT result = result && 'abc' ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("SELECTION-SCREEN title, b1_tit can be set", () => {
    const abap =
      "SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE b1_tit.\n" +
      "SELECTION-SCREEN END OF BLOCK b1.\n" +
      "INITIALIZATION.\n" +
      "  b1_tit = 'moo'.";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("SELECTION-SCREEN tab button", () => {
    const abap =
      "SELECTION-SCREEN: BEGIN OF TABBED BLOCK b1 FOR 18 LINES,\n" +
      "                    TAB (40) button1 USER-COMMAND push1 DEFAULT SCREEN 200,\n" +
      "                  END OF BLOCK b1.\n" +
      "SELECTION-SCREEN BEGIN OF SCREEN 200 AS SUBSCREEN.\n" +
      "SELECTION-SCREEN END OF SCREEN 200.\n" +
      "INITIALIZATION.\n" +
      "  button1 = 'moo'.";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, unknown field-symbol", () => {
    const abap = "WRITE <moo>.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("program, just the field-symbol definition", () => {
    const abap = "FIELD-SYMBOLS: <ls_match> TYPE c.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, inline FS definition", () => {
    const abap = `
    DATA moo TYPE STANDARD TABLE OF string WITH EMPTY KEY.
    LOOP AT moo ASSIGNING FIELD-SYMBOL(<moo>).
      WRITE <moo>.
    ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("PROG, INCLUDEs", () => {
    const prog1 = `
      DATA moo TYPE string.
      INCLUDE zincl.`;
    const zincl = `
      WRITE moo.
      WRITE boo.`;
    const issues = runMulti([
      {filename: "zprog1.prog.abap", contents: prog1},
      {filename: "zincl.prog.abap", contents: zincl},
      {filename: "zincl.prog.xml", contents: "<SUBC>I</SUBC>"}]);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("boo");
  });

  it("program, local class definition and implementation in include", () => {
    const prog1 = `
      DATA moo TYPE string.
      INCLUDE zincl.`;
    const zincl = `
      CLASS lcl_foobar DEFINITION FINAL.
      ENDCLASS.
      CLASS lcl_foobar IMPLEMENTATION.
      ENDCLASS.`;
    const issues = runMulti([
      {filename: "zprog1.prog.abap", contents: prog1},
      {filename: "zincl.prog.abap", contents: zincl},
      {filename: "zincl.prog.xml", contents: "<SUBC>I</SUBC>"}]);
    expect(issues.length).to.equals(0);
  });

  it("minimal function group", () => {
    const f01abap = `FORM foo.
      WRITE gv_bar.
    ENDFORM.`;
    const f01xml = `<?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <PROGDIR>
      <NAME>LZMINIMALF01</NAME>
      <SUBC>I</SUBC>
      <APPL>S</APPL>
      <RLOAD>E</RLOAD>
      <UCCHECK>X</UCCHECK>
     </PROGDIR>
     <TPOOL>
      <item>
       <ID>R</ID>
       <ENTRY>Include LZMINIMALF01</ENTRY>
       <LENGTH>20</LENGTH>
      </item>
     </TPOOL>
    </asx:values>
   </asx:abap>
  </abapGit>`;
    const topabap = `FUNCTION-POOL zminimal.
    DATA gv_bar TYPE string.`;
    const topxml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <PROGDIR>
        <NAME>LZMINIMALTOP</NAME>
        <DBAPL>S</DBAPL>
        <DBNA>D$</DBNA>
        <SUBC>I</SUBC>
        <APPL>S</APPL>
        <FIXPT>X</FIXPT>
        <LDBNAME>D$S</LDBNAME>
        <UCCHECK>X</UCCHECK>
       </PROGDIR>
      </asx:values>
     </asx:abap>
    </abapGit>`;
    const saplabap = `
    INCLUDE lzminimaltop.
    INCLUDE lzminimaluxx.
    INCLUDE lzminimalf01.`;
    const saplxml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <PROGDIR>
        <NAME>SAPLZMINIMAL</NAME>
        <DBAPL>S</DBAPL>
        <DBNA>D$</DBNA>
        <SUBC>F</SUBC>
        <APPL>S</APPL>
        <RLOAD>E</RLOAD>
        <FIXPT>X</FIXPT>
        <LDBNAME>D$S</LDBNAME>
        <UCCHECK>X</UCCHECK>
       </PROGDIR>
      </asx:values>
     </asx:abap>
    </abapGit>`;
    const fugrxml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <AREAT>Minimal</AREAT>
       <INCLUDES>
       <SOBJ_NAME>LZMINIMALF01</SOBJ_NAME>
       <SOBJ_NAME>LZMINIMALTOP</SOBJ_NAME>
       <SOBJ_NAME>SAPLZMINIMAL</SOBJ_NAME>
       </INCLUDES>
       <FUNCTIONS>
        <item>
         <FUNCNAME>Z_MINIMAL</FUNCNAME>
         <SHORT_TEXT>hello</SHORT_TEXT>
        </item>
       </FUNCTIONS>
      </asx:values>
     </asx:abap>
    </abapGit>`;
    const functionabap = `FUNCTION z_minimal.
      WRITE gv_bar.
      PERFORM foo.
    ENDFUNCTION.`;
    const issues = runMulti([
      {filename: "zminimal.fugr.lzminimalf01.abap", contents: f01abap},
      {filename: "zminimal.fugr.lzminimalf01.xml", contents: f01xml},
      {filename: "zminimal.fugr.lzminimaltop.abap", contents: topabap},
      {filename: "zminimal.fugr.lzminimaltop.xml", contents: topxml},
      {filename: "zminimal.fugr.saplzminimal.abap", contents: saplabap},
      {filename: "zminimal.fugr.saplzminimal.xml", contents: saplxml},
      {filename: "zminimal.fugr.xml", contents: fugrxml},
      {filename: "zminimal.fugr.z_minimal.abap", contents: functionabap}]);
    expect(issues.length).to.equals(0);
  });

  it("PROG, wrong sequence of definition and implementation", () => {
    const abap = `
    CLASS lcl_foobar IMPLEMENTATION.
    ENDCLASS.
    CLASS lcl_foobar DEFINITION FINAL.
    ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("PROG, selection screen comment", () => {
    const abap = `
      SELECTION-SCREEN COMMENT 1(10) s_url FOR FIELD p_foo.
      PARAMETERS p_foo TYPE string.
      INITIALIZATION.
        s_url = 'sdf'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("PROG, PERFORM not found", () => {
    const abap = `PERFORM foo.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("PROG, PERFORM found", () => {
    const abap = `
    FORM foo.
    ENDFORM.
    PERFORM foo.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("PROG, PERFORM cyclic, allowed", () => {
    const abap = `
      FORM bar.
        PERFORM foo.
      ENDFORM.
      FORM foo.
        PERFORM bar.
      ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("CONSTANTS, missing VALUE", () => {
    const abap = `CONSTANTS foo TYPE string.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("DATA, negative LENGTH", () => {
    const abap = `DATA foo TYPE c LENGTH -5.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("DATA, double lenght specified", () => {
    const abap = `DATA foo(4) TYPE c length 2.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("expect syntax error, <comp> not found", () => {
    const abap = `DATA ls_structure TYPE string.
    ASSIGN COMPONENT 'FOO' OF STRUCTURE ls_structure TO <comp>.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("SORT, expect 0 errors", () => {
    const abap = `DATA tab TYPE STANDARD TABLE OF i.
      SORT tab BY table_line.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("Field offset, lv_i not specified", () => {
    const abap = `
      DATA rv_s TYPE string.
      rv_s+lv_i(1) = 'a'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("lv_i");
  });

  it.skip("DATA, already specified", () => {
    const abap = `DATA foo.\nDATA foo.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it.skip("program, constant, begin, error", () => {
    const abap =
      "CONSTANTS: BEGIN OF c_mode,\n" +
      "             create TYPE i VALUE 1,\n" +
      "           END OF c_mode.\n" +
      "WRITE create.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it.skip("program, sy field, unknown field", () => {
    const abap = "WRITE sy-fooboo.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it.skip("program, definition in FOR expression, should not work after", () => {
    const abap = "DATA itab TYPE STANDARD TABLE OF i.\n" +
      "itab = VALUE #( FOR j = 1 THEN j + 1 UNTIL j > 10 ( j ) ).\n" +
      "WRITE j.";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("constant from super class", () => {
    const abap = `
CLASS lcl_super DEFINITION.
  PUBLIC SECTION.
    CONSTANTS const TYPE i VALUE 1.
ENDCLASS.
CLASS lcl_super IMPLEMENTATION.
ENDCLASS.

CLASS lcl_sub DEFINITION INHERITING FROM lcl_super.
  PUBLIC SECTION.
    METHODS moo.
ENDCLASS.
CLASS lcl_sub IMPLEMENTATION.
  METHOD moo.
    WRITE const.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("static class not found", () => {
    const abap = `zcl_bar=>method( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("zcl_bar");
  });

  it("static method not found", () => {
    const abap = `
    CLASS lcl_bar DEFINITION.
    ENDCLASS.
    CLASS lcl_bar IMPLEMENTATION.
    ENDCLASS.
    lcl_bar=>moo( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("moo");
  });

  it("static method found", () => {
    const abap = `
    CLASS lcl_bar DEFINITION.
      PUBLIC SECTION.
        CLASS-METHODS: moo.
    ENDCLASS.
    CLASS lcl_bar IMPLEMENTATION.
      METHOD moo.
      ENDMETHOD.
    ENDCLASS.
    lcl_bar=>moo( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("voided class should not give error", () => {
    const abap = `
  cl_foobar=>moo(
    act = 123
    exp = '3344' ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("call instance method", () => {
    const abap = `
CLASS zcl_foobar DEFINITION.
  PUBLIC SECTION.
    METHODS hello.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD hello.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA foo TYPE REF TO zcl_foobar.
  CREATE OBJECT foo.
  foo->hello( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("longer chain, ref to itself", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS: get_gui RETURNING VALUE(sdf) TYPE REF TO lcl_bar.
    METHODS: go_home.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD get_gui.
  ENDMETHOD.
  METHOD go_home.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  lcl_bar=>get_gui( )->go_home( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("longer chain, with interface", () => {
    const abap = `
  INTERFACE lif_foo.
    METHODS go_home.
  ENDINTERFACE.
  CLASS lcl_bar DEFINITION.
    PUBLIC SECTION.
      CLASS-METHODS: get_gui RETURNING VALUE(sdf) TYPE REF TO lif_foo.
  ENDCLASS.
  CLASS lcl_bar IMPLEMENTATION.
    METHOD get_gui.
    ENDMETHOD.
  ENDCLASS.

  START-OF-SELECTION.
    lcl_bar=>get_gui( )->go_home( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("call method from super class", () => {
    const abap = `
CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    METHODS: name.
ENDCLASS.
CLASS lcl_foo IMPLEMENTATION.
  METHOD name.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_bar DEFINITION INHERITING FROM lcl_foo.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.
START-OF-SELECTION.
  DATA bar TYPE REF TO lcl_bar.
  bar->name( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("no errors from dynamic", () => {
    const abap = `
  DATA rv_result TYPE i.
  CALL METHOD ('CL_APJ_SCP_TOOLS')=>('IS_RESTART_REQUIRED')
    RECEIVING
      restart_required = rv_result.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("no errors from dynamic", () => {
    const abap = `
CLASS lcl_viewer DEFINITION.
  PUBLIC SECTION.
    METHODS: show_callstack.
ENDCLASS.
CLASS lcl_viewer IMPLEMENTATION.
  METHOD show_callstack.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS:
      goto_callstack,
      get_exception_viewer
        RETURNING
          VALUE(ro_sdf) TYPE REF TO lcl_viewer.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD get_exception_viewer.
  ENDMETHOD.
  METHOD goto_callstack.
    get_exception_viewer( )->show_callstack( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("constructors always exists", () => {
    const abap = `
CLASS lcl_super DEFINITION.
ENDCLASS.
CLASS lcl_super IMPLEMENTATION.
ENDCLASS.
CLASS lcl_bar DEFINITION INHERITING FROM lcl_super .
  PUBLIC SECTION.
    METHODS:
      constructor.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD constructor.
    super->constructor( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("constructor via CALL METHOD, typical for exception classes", () => {
    const abap = `
CLASS lcl_super DEFINITION.
ENDCLASS.
CLASS lcl_super IMPLEMENTATION.
ENDCLASS.
CLASS lcl_bar DEFINITION INHERITING FROM lcl_super .
  PUBLIC SECTION.
    METHODS:
      constructor.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD constructor.
    CALL METHOD SUPER->CONSTRUCTOR.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("chained call, ls_foo-stage->rm( )", () => {
    const abap = `
CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    METHODS: rm.
ENDCLASS.
CLASS lcl_foo IMPLEMENTATION.
  METHOD rm.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS:
      run.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD run.
    TYPES: BEGIN OF ty_foo,
             stage TYPE REF TO lcl_foo,
           END OF ty_foo.
    DATA ls_foo TYPE ty_foo.

    ls_foo-stage->rm( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("chained call, component not found", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS:
      run.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD run.
    TYPES: BEGIN OF ty_foo,
             stage TYPE i,
           END OF ty_foo.
    DATA ls_foo TYPE ty_foo.

    ls_foo-unkown_field->rm( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("unkown_field", "Got: \"" + issues[0].getMessage() + "\"");
  });

  it("no error for void structures", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS:
      run.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD run.
    DATA ls_foo TYPE sdfsdfdfsfdsfsd.
    ls_foo-not_found->rm( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("NEW starts chain", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS:
      run.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  NEW lcl_bar( )->run( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("Voided class should not give error", () => {
    const abap = `NEW cl_foobar( )->run( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("Voided class should not give error, 2", () => {
    const abap = `DATA(lo_instance) = cl_oo_factory=>create_instance( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("built-in lines( )", () => {
    const abap = `
DATA lt_bar TYPE STANDARD TABLE OF string.
DATA(result) = lines( lt_bar ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("built-in to_upper", () => {
    const abap = `
DATA(result) = to_upper( |bar| ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("built-in to_lower", () => {
    const abap = `
DATA(result) = to_lower( |bar| ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("infer type via NEW", () => {
    const abap = `
  CLASS lcl_bar DEFINITION.
  ENDCLASS.
  CLASS lcl_bar IMPLEMENTATION.
  ENDCLASS.
  DATA mo_moo TYPE REF TO lcl_bar.
  mo_moo = NEW #( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("attribute from super class", () => {
    const abap = `
CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    DATA: int TYPE i.
ENDCLASS.
CLASS lcl_foo IMPLEMENTATION.
ENDCLASS.
CLASS lcl_bar DEFINITION INHERITING FROM lcl_foo.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.
DATA mo_moo TYPE REF TO lcl_bar.
DATA(target) = mo_moo->int.
`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("attribute from super class 2", () => {
    const abap = `
CLASS lcl_abapgit_xml DEFINITION.
  PUBLIC SECTION.
    DATA: mi_ixml TYPE REF TO lcl_abapgit_xml.
    METHODS run RETURNING VALUE(ref) TYPE REF TO lcl_abapgit_xml.
ENDCLASS.
CLASS lcl_abapgit_xml IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.

CLASS ltcl_xml_concrete DEFINITION INHERITING FROM lcl_abapgit_xml.
ENDCLASS.
CLASS ltcl_xml_concrete IMPLEMENTATION.
ENDCLASS.

CLASS ltcl_test DEFINITION.
  PRIVATE SECTION.
    METHODS run.
    DATA: mo_xml TYPE REF TO ltcl_xml_concrete.
ENDCLASS.
CLASS ltcl_test IMPLEMENTATION.
  METHOD run.
    DATA li_bar TYPE REF TO lcl_abapgit_xml.
    li_bar = mo_xml->mi_ixml->run( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("Constant from interface", () => {
    const abap = `
INTERFACE lif_bar.
  CONSTANTS moo TYPE i VALUE 1.
ENDINTERFACE.

START-OF-SELECTION.
  WRITE lif_bar=>moo.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("Inline DATA in voided call", () => {
    const abap = `
  DATA lt_list TYPE STANDARD TABLE OF string.
  cl_salv_table=>factory(
    IMPORTING
      r_salv_table = DATA(lo_alv)
    CHANGING
      t_table      = lt_list ).
  lo_alv->get_functions( )->set_all( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("method EXPORTING", () => {
    const abap = `
CLASS lcl_exporting DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS: run
      EXPORTING ev_bar TYPE i.
ENDCLASS.
CLASS lcl_exporting IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA int TYPE i.
  lcl_exporting=>run( IMPORTING ev_bar = int ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("error, method parameter does not exist", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS method.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD method.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA mo_moo TYPE REF TO lcl_bar.
  mo_moo = NEW #( ).
  mo_moo->method( something = 'no' ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage().toLowerCase()).to.contain("something");
  });

  it("error, no importing parameters", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS method.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD method.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA mo_moo TYPE REF TO lcl_bar.
  mo_moo = NEW #( ).
  mo_moo->method( 123 ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage().toLowerCase()).to.contain("no importing parameters");
  });

  it("method must have RETURNING", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS method.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD method.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA mo_moo TYPE REF TO lcl_bar.
  DATA int TYPE i.
  mo_moo = NEW #( ).
  int = mo_moo->method( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage().toLowerCase()).to.contain("type");
  });

  it("WHEN TYPE", () => {
    const abap = `
  DATA lo_bar TYPE REF TO object.
  CASE TYPE OF lo_bar.
    WHEN TYPE zcl_foobar.
    WHEN OTHERS.
  ENDCASE.
  `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1); // global class not found
  });

  it("attribute with interface prefix", () => {
    const abap = `
INTERFACE lif_def.
  DATA foo TYPE c.
ENDINTERFACE.
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    INTERFACES: lif_def.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.

DATA foo TYPE REF TO lcl_bar.
DATA(bar) = foo->lif_def~foo.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("LOOP AT SCREEN, on 702", () => {
    const abap = `LOOP AT SCREEN.
    ENDLOOP.`;
    const issues = runProgram(abap, [], Version.v702);
    expect(issues.length).to.equals(0);
  });

  it("LOOP, 702", () => {
    const abap = `DATA tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA row TYPE string.
  LOOP AT tab INTO row FROM 3.
  ENDLOOP.`;
    const issues = runProgram(abap, [], Version.v702);
    expect(issues.length).to.equals(0);
  });

  it("data reference", () => {
    const abap = `TYPES: BEGIN OF ty_log,
  item TYPE i,
END OF ty_log.
DATA lr_log TYPE REF TO ty_log.
DATA(item) = lr_log->item.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("data reference, component not found in structure", () => {
    const abap = `TYPES: BEGIN OF ty_log,
  item TYPE i,
END OF ty_log.
DATA lr_log TYPE REF TO ty_log.
DATA(item) = lr_log->not_found.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("EXPORT DATABASE", () => {
    const abap = `DATA gt_data TYPE TABLE OF string.
EXPORT data = gt_data TO DATABASE indx(zr) ID 'TEST'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("IMPORT DATABASE", () => {
    const abap = `DATA gt_data TYPE TABLE OF string.
IMPORT data = gt_data FROM DATABASE indx(zr) ID 'TEST'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FORM with TABLES", () => {
    const abap = `
DATA: BEGIN OF data_foo,
        moo TYPE i,
      END OF data_foo.
FORM foo TABLES i_where STRUCTURE data_foo.
  READ TABLE i_where INDEX 1 TRANSPORTING NO FIELDS.
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FORM with TABLES without structure", () => {
    const abap = `
FORM foo TABLES bar.
  READ TABLE bar INDEX 1 TRANSPORTING NO FIELDS.
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("expect error, zsfsdfds=>lv_bar inside string template not defined", () => {
    const abap = `DATA(lv_url) = |{ zsfsdfds=>lv_bar }|.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("zsfsdfds");
  });

  it("expect error, zcl=>method not defined", () => {
    const abap = `
IF 2 = zcl=>method( ).
  WRITE 2.
ENDIF.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("zcl");
  });

  it("WRITE sy-tfill", () => {
    const abap = `WRITE sy-tfill.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it.skip("sy-sdfsdsdf not found", () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF i.
    DESCRIBE TABLE tab LINES sy-sdfsdsdf.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("sdfsdsdf");
  });

  it("APPEND, expect class not found", () => {
    const abap = `
TYPES: BEGIN OF ty_tab,
         moo TYPE i,
       END OF ty_tab.
DATA tab TYPE STANDARD TABLE OF ty_tab.
APPEND VALUE #( moo = zcl_bsdfsd=>bar ) TO tab.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("zcl_bsdfsd");
  });

  it("INSERT, expect class not found", () => {
    const abap = `
TYPES: BEGIN OF ty_tab,
         moo TYPE i,
       END OF ty_tab.
DATA tab TYPE STANDARD TABLE OF ty_tab.
INSERT VALUE #( moo = zcl_bsdfsd=>bar ) INTO TABLE tab.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("zcl_bsdfsd");
  });

  it("APPEND CAST #", () => {
    const abap = `
  CLASS lcl_bar DEFINITION.
  ENDCLASS.
  CLASS lcl_bar IMPLEMENTATION.
  ENDCLASS.

  DATA lt_bar TYPE STANDARD TABLE OF REF TO lcl_bar.
  APPEND CAST #( NEW lcl_bar( ) ) TO lt_bar.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("APPEND INITIAL LINE ASSIGNING", () => {
    const abap = `
  DATA lt_bar TYPE STANDARD TABLE OF i.
  FIELD-SYMBOLS <lv_bar> LIKE LINE OF lt_bar.
  APPEND INITIAL LINE TO lt_bar ASSIGNING <lv_bar>.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("APPEND to field symbol", () => {
    const abap = `
TYPES: BEGIN OF ty_bar,
         tab TYPE STANDARD TABLE OF i WITH EMPTY KEY,
       END OF ty_bar.
FIELD-SYMBOLS <foo> TYPE ty_bar.
APPEND 2 TO <foo>-tab.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("APPEND void", () => {
    const abap = `
DATA lt_void TYPE somethingsomething.
APPEND 2 TO lt_void.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("move to class static", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-DATA data TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.

lcl_bar=>data = 2.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("move to voided", () => {
    const abap = `cl_void=>data = 2.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("multi level aliases via interfaces", () => {
    const abap = `
INTERFACE if_toptop.
  METHODS bar.
ENDINTERFACE.

INTERFACE if_top.
  INTERFACES if_toptop.
  ALIASES bar FOR if_toptop~bar.
ENDINTERFACE.

INTERFACE if_sub.
  INTERFACES if_top.
  ALIASES bar FOR if_top~bar.
ENDINTERFACE.

DATA moo TYPE REF TO if_sub.
moo->bar( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("with syntax errors", () => {
    const abap = `
INTERFACE lif_foo.
  METHODS bar.
  sfsdfsdfsfs
ENDINTERFACE.

FORM fffds.
  DATA li_sdf TYPE REF TO lif_foo.
  li_sdf->bar( ).
  li_sdf->expect_error( ).
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("expect_error");
  });

  it("expect error", () => {
    const abap = `WRITE zif_sdfsd=>sdfsd.`;

    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("multi level CONSTANTS aliases via interfaces", () => {
    const abap = `
INTERFACE if_top.
  CONSTANTS bar TYPE i VALUE 1.
ENDINTERFACE.

INTERFACE if_sub.
  INTERFACES if_top.
  ALIASES bar FOR if_top~bar.
ENDINTERFACE.

WRITE if_sub=>bar.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("Table with header line", () => {
    const abap = `
TYPES: BEGIN OF ty_structure,
         bar TYPE string,
       END OF ty_structure.
DATA bar TYPE TABLE OF ty_structure WITH HEADER LINE.
WRITE bar-bar.
`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("Table with header line, voided", () => {
    const abap = `
DATA bar TYPE TABLE OF voided_void WITH HEADER LINE.
WRITE bar-bar.
`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("LIKE DDIC structure, 2", () => {
    const xml = `
    <?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <DD02V>
        <TABNAME>SDF</TABNAME>
        <DDLANGUAGE>E</DDLANGUAGE>
        <TABCLASS>INTTAB</TABCLASS>
        <DDTEXT>sdf</DDTEXT>
        <EXCLASS>1</EXCLASS>
       </DD02V>
       <DD03P_TABLE>
        <DD03P>
         <TABNAME>SDF</TABNAME>
         <FIELDNAME>STR</FIELDNAME>
         <DDLANGUAGE>E</DDLANGUAGE>
         <POSITION>0001</POSITION>
         <ADMINFIELD>0</ADMINFIELD>
         <INTTYPE>C</INTTYPE>
         <INTLEN>000040</INTLEN>
         <DATATYPE>CHAR</DATATYPE>
         <LENG>000020</LENG>
         <MASK>  CHAR</MASK>
        </DD03P>
       </DD03P_TABLE>
      </asx:values>
     </asx:abap>
    </abapGit>
    `;
    const prog = `DATA foo LIKE sdf.`;
    const issues = runMulti([
      {filename: "sdf.tabl.xml", contents: xml},
      {filename: "zfoobar.prog.abap", contents: prog},
    ]);
    expect(issues.length).to.equals(0);
  });

  it("OCCURS in a BEGIN always gives header lines?", () => {
    const abap = `
TYPES: BEGIN OF bar,
         foo TYPE c,
       END OF bar.

DATA BEGIN OF tables_tab OCCURS 10.
INCLUDE TYPE bar.
DATA END OF tables_tab.

tables_tab-foo = 'A'.
`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("RANGES, with header line", () => {
    const abap = `
  RANGES foo FOR sy-mandt.
  foo-low = '123'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FORM TABLES STRUCTURE, contains header line", () => {
    const abap = `
DATA: BEGIN OF stru,
        foo TYPE string,
      END OF stru.
FORM bar TABLES tab STRUCTURE stru.
  WRITE tab-foo.
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("WRITE sy-msgty.", () => {
    const abap = `WRITE sy-msgty.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("Reference to data type defined locally", () => {
    const abap = `
    TYPES ztype TYPE c LENGTH 1.
    DATA sdf TYPE REF TO ztype.
    sdf = NEW ztype( abap_true ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("is_pair not defined, expect error", () => {
    const abap = `
    DATA: lv_distance TYPE i.
    lv_distance = 2 - is_pair-distance.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("is_pair");
  });

  it("CASE for not defined variable", () => {
    const abap = `
CASE something.
  WHEN 'A'.
  WHEN OTHERS.
ENDCASE.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("DO for not defined variable", () => {
    const abap = `
DO something TIMES.
  WRITE 'bar'.
ENDDO.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("substring", () => {
    const abap = `
    DATA mv_compressed TYPE string.
    WRITE mv_compressed(something).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("offset", () => {
    const abap = `
    DATA mv_compressed TYPE string.
    WRITE mv_compressed+something.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("READ TABLE INTO something", () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF string.
  READ TABLE tab INDEX 1 INTO something.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("CONCATENATE INTO something", () => {
    const abap = `CONCATENATE 'a' 'b' INTO something.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("CALL FUNCTION sometthing", () => {
    const abap = `
    CALL FUNCTION 'MOO'
      EXPORTING
        bar = something.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("CLEAR something", () => {
    const abap = `CLEAR something.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("PERFORM something, USING", () => {
    const abap = `
    FORM foo USING bar.
    ENDFORM.
    PERFORM foo USING something.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("PERFORM something, CHANGING", () => {
    const abap = `
    FORM foo CHANGING bar foo.
    ENDFORM.
    DATA lv_bar.
    PERFORM foo CHANGING lv_bar something.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("INDEX something", () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF string.
    DATA val TYPE string.
    READ TABLE tab INDEX something INTO val.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("ASSIGNING <something>", () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF string.
    LOOP AT tab ASSIGNING <something>.
      WRITE 'bar'.
    ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("<something>");
  });

  it("call method, something", () => {
    const abap = `cl_foo=>bar( RECEIVING out = something ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("CATCH INTO something", () => {
    const abap = `
    TRY.
      CATCH cx_errror INTO something.
    ENDTRY.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("CALL METHOD something->", () => {
    const abap = `CALL METHOD something->('BLAH').`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("READ TABLE ASSIGNING ssomething", () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF string.
    READ TABLE tab ASSIGNING <something> INDEX 1.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("<something>");
  });

  it("DELETE tab something", () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF string.
    DELETE tab WHERE table_line = something.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("LOOP AT WHERE something", () => {
    const abap = `
    DATA lt_remote TYPE STANDARD TABLE OF string.
    LOOP AT lt_remote TRANSPORTING NO FIELDS WHERE table_line = something.
    ENDLOOP.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("WHEN something", () => {
    const abap = `
    CASE |bar|.
      WHEN something.
    ENDCASE.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("CREATE DATA something", () => {
    const abap = `CREATE DATA something TYPE REF TO ('SFSDFS').`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

// todo, static method cannot access instance attributes
// todo, can a private method access protected attributes?
// todo, readonly fields(constants + enums + attributes flagged read-only)

});