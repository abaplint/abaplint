import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {Issue} from "../../../src/issue";
import {Config} from "../../../src/config";
import {IRegistry} from "../../../src/_iregistry";
import {getABAPObjects} from "../../get_abap";

function run(reg: IRegistry, globalConstants?: string[]): Issue[] {
  let ret: Issue[] = [];

  if (globalConstants) {
    const config = reg.getConfig().get();
    config.syntax.globalConstants = globalConstants;
    reg.setConfig(new Config(JSON.stringify(config)));
  }

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
  reg.parse();
  return run(reg);
}

function runClass(abap: string): Issue[] {
  const file = new MemoryFile("zcl_foobar.clas.abap", abap);
  const reg = new Registry().addFile(file).parse();
  return run(reg);
}

function runProgram(abap: string, globalConstants?: string[]): Issue[] {
  const file = new MemoryFile("zfoobar.prog.abap", abap);
  const reg: IRegistry = new Registry().addFile(file).parse();
  return run(reg, globalConstants);
}

////////////////////////////////////////////////////////////

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
    const abap = "SELECT-OPTIONS foo FOR structure-field.\nWRITE foo.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
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

  it("program, component after call", () => {
// todo, this code is not syntactically correct
    const abap = "DATA field TYPE string.\n" +
      "field = get_something( )-date.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
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

  it("FORMAT INTENSIFIED OFF.", () => {
    const abap = "FORMAT INTENSIFIED OFF.\n";
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
    const abap = "DATA it_result TYPE c.\n" +
      "DATA(output) = REDUCE string( INIT result = ||\n" +
      "  FOR <result> IN it_result\n" +
      "  NEXT result = result && 'abc' ).";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FOR, loop IN", () => {
    const abap = "DATA moo TYPE c.\n" +
      "DATA it_packages TYPE c.\n" +
      "moo = VALUE #(\n" +
      "  FOR lo_package IN it_packages\n" +
      "  FOR lo_element IN get_all_elements_from_package( lo_package )\n" +
      "  ( package = lo_package element = lo_element ) ).";
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
    DATA moo TYPE c.
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

  it("CALL METHOD, static class and method", () => {
// todo, actually cl_foo is unknown
    const abap = `CALL METHOD cl_foo=>bar( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("Field offset, lv_i not specified", () => {
    const abap = `DATA rv_s TYPE string.
      rv_s+lv_i(1) = 'a'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
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

// todo, static method cannot access instance attributes
// todo, can a private method access protected attributes?
// todo, readonly fields(constants + enums + attributes flagged read-only)

});