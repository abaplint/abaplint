import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {Issue} from "../../../src/issue";
import {Config} from "../../../src/config";
import {IRegistry} from "../../../src/_iregistry";
import {getABAPObjects} from "../../get_abap";
import {Version} from "../../../src/version";
import {MemoryFile} from "../../../src/files/memory_file";

function run(reg: IRegistry, globalConstants?: string[], version?: Version, errorNamespace?: string): Issue[] {
  let ret: Issue[] = [];

  const config = reg.getConfig().get();
  if (globalConstants) {
    config.syntax.globalConstants = globalConstants;
  }
  if (version) {
    config.syntax.version = version;
  }
  if (errorNamespace) {
    config.syntax.errorNamespace = errorNamespace;
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

function runInterface(abap: string): Issue[] {
  const file = new MemoryFile("zif_foobar.intf.abap", abap);
  const reg = new Registry().addFile(file);
  return run(reg);
}

function runProgram(abap: string, globalConstants?: string[], version?: Version, errorNamespace?: string): Issue[] {
  const file = new MemoryFile("zfoobar.prog.abap", abap);
  const reg: IRegistry = new Registry().addFile(file);
  return run(reg, globalConstants, version, errorNamespace);
}

////////////////////////////////////////////////////////////

describe("syntax.ts, Check Variables", () => {

  const ztab = `
  <?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <DD02V>
      <TABNAME>ZTAB</TABNAME>
      <DDLANGUAGE>E</DDLANGUAGE>
      <TABCLASS>TRANSP</TABCLASS>
      <DDTEXT>transparent table</DDTEXT>
      <CONTFLAG>A</CONTFLAG>
     </DD02V>
     <DD09L>
      <TABNAME>ZTAB</TABNAME>
      <AS4LOCAL>A</AS4LOCAL>
      <TABKAT>0</TABKAT>
      <TABART>APPL0</TABART>
      <BUFALLOW>N</BUFALLOW>
     </DD09L>
     <DD03P_TABLE>
      <DD03P>
       <TABNAME>ZTAB</TABNAME>
       <FIELDNAME>FIELD1</FIELDNAME>
       <DDLANGUAGE>E</DDLANGUAGE>
       <POSITION>0001</POSITION>
       <KEYFLAG>X</KEYFLAG>
       <ADMINFIELD>0</ADMINFIELD>
       <INTTYPE>C</INTTYPE>
       <INTLEN>000040</INTLEN>
       <NOTNULL>X</NOTNULL>
       <DATATYPE>CHAR</DATATYPE>
       <LENG>000020</LENG>
       <MASK>  CHAR</MASK>
      </DD03P>
      <DD03P>
       <TABNAME>ZTAB</TABNAME>
       <FIELDNAME>VALUE1</FIELDNAME>
       <DDLANGUAGE>E</DDLANGUAGE>
       <POSITION>0002</POSITION>
       <ADMINFIELD>0</ADMINFIELD>
       <INTTYPE>X</INTTYPE>
       <INTLEN>000004</INTLEN>
       <DATATYPE>INT4</DATATYPE>
       <LENG>000010</LENG>
       <MASK>  INT4</MASK>
      </DD03P>
     </DD03P_TABLE>
    </asx:values>
   </asx:abap>
  </abapGit>`;

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
    expect(issues[0]?.getMessage()).to.equals(undefined);
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
    const abap = `TYPES: BEGIN OF ty_bar,
    tag TYPE string,
  END OF ty_bar.
DATA lt_map TYPE STANDARD TABLE OF ty_bar.
DATA iv_tag TYPE string.
READ TABLE lt_map WITH KEY tag = iv_tag TRANSPORTING NO FIELDS.`;
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
    const abap = `
    TYPES: BEGIN OF ENUM enum_name,
            value1,
    END OF ENUM enum_name.
    DATA var_name TYPE enum_name.
    var_name = value1.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("value from ENUM, object oriented", () => {
    const abap = `CLASS lcl_foo DEFINITION.
        PUBLIC SECTION.
          TYPES:
            BEGIN OF ENUM enum_name,
              value1,
            END OF ENUM enum_name.
          METHODS: moo.
      ENDCLASS.
      CLASS lcl_foo IMPLEMENTATION.
        METHOD moo.
          WRITE value1.
        ENDMETHOD.
      ENDCLASS.`;
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
      DATA rv_s TYPE c LENGTH 10.
      rv_s+lv_i(1) = 'a'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("lv_i");
  });

  it("DATA, already specified", () => {
    const abap = `DATA foo.\nDATA foo.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("program, constant, begin, error", () => {
    const abap =
      "CONSTANTS: BEGIN OF c_mode,\n" +
      "             create TYPE i VALUE 1,\n" +
      "           END OF c_mode.\n" +
      "WRITE create.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("program, sy field, unknown field", () => {
    const abap = "WRITE sy-fooboo.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("program, definition in FOR expression, should not work after", () => {
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

  it("WHEN TYPE, ok", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA foo TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

START-OF-SELECTION.
  DATA lo_artefact TYPE REF TO object.
  CASE TYPE OF lo_artefact.
    WHEN TYPE lcl INTO DATA(lo_lcl).
      WRITE lo_lcl->foo.
  ENDCASE.
  `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
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

  it("sy-sdfsdsdf not found", () => {
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

  it("INCLUDE TYPE FROM ddic", () => {
    const abap = `
      TYPES BEGIN OF ty_file.
      INCLUDE TYPE ztab.
      TYPES END OF ty_file.`;
    const issues = runMulti([
      {filename: "ztab.tabl.xml", contents: ztab},
      {filename: "zfoobar.prog.abap", contents: abap},
    ]);
    expect(issues.length).to.equals(0);
  });

  it("LOOP at ddic type", () => {
    const abap = `
    DATA lt_cache TYPE STANDARD TABLE OF ztab WITH DEFAULT KEY.
    FIELD-SYMBOLS <ls_cache> LIKE LINE OF lt_cache.
    LOOP AT lt_cache ASSIGNING <ls_cache>.
      WRITE <ls_cache>-field1.
    ENDLOOP.`;
    const issues = runMulti([
      {filename: "ztab.tabl.xml", contents: ztab},
      {filename: "zfoobar.prog.abap", contents: abap},
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

  it("PERFORM something, CHANGING, dynamic", () => {
    const abap = `
    FORM foo CHANGING bar foo.
    ENDFORM.
    DATA lv_bar.
    PERFORM ('FOO') CHANGING lv_bar something.`;
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

  it("SPLIT INTO TABLE something", () => {
    const abap = `SPLIT |foobar| AT |sdf| INTO TABLE something.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("CALL METHOD with dynamic, expect error", () => {
    const abap = `
  DATA ref TYPE REF TO object.
  CALL METHOD ref->('METHOD')
    RECEIVING
      result = something.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("BOOLC, something", () => {
    const abap = `WRITE boolc( something = |sdf| ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("calculation, something", () => {
    const abap = `
    DATA lv_f TYPE f.
    lv_f = ( something / 2 ) * 100.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("dynamic method call, something", () => {
    const abap = `CALL METHOD (something)=>bar.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("SORT something", () => {
    const abap = `SORT something BY ('ABC').`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("SELECT something", () => {
    const abap = `
    SELECT SINGLE * FROM bar INTO @DATA(sdf) WHERE field = @something.
    WRITE sdf.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("INSERT database something", () => {
    const abap = `INSERT databasetabl FROM TABLE something.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("SELECT, for all entries", () => {
    const abap = `
TYPES: BEGIN OF ty_type,
         field TYPE c LENGTH 1,
       END OF ty_type.
DATA: lt_fae TYPE STANDARD TABLE OF ty_type.
SELECT column FROM table INTO TABLE @DATA(lt_results)
  FOR ALL ENTRIES IN lt_fae
  WHERE column = @lt_fae-field.

DELETE TABLE lt_results FROM 10.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0, issues[0]?.getMessage());
  });

  it("APPEND INITIAL LINE ASSSIGNING something", () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF string.
    APPEND INITIAL LINE TO tab ASSIGNING <something>.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("<something>");
  });

  it("LOOP AT FROM something", () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF string.
  LOOP AT tab INTO DATA(row) FROM something.
    WRITE row.
  ENDLOOP.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("something");
  });

  it("resolve dashed name, source", () => {
    const abap = `
    DATA dummy-name TYPE c LENGTH 1.
    WRITE dummy-name.
    `;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("dashed name, target", () => {
    const abap = `
    DATA: hok-code TYPE string.
    hok-code = 'DISP'.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("get runtime inline", () => {
    const abap = `
  GET RUN TIME FIELD DATA(stop).
  WRITE stop.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("built-in match function", () => {
    const abap = `DATA(result) = match( val = || regex = || ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("FIND, MATCH OFFSET inline", () => {
    const abap = `
    FIND |sdf| IN |sdfsd| IGNORING CASE MATCH OFFSET DATA(offset).
    WRITE offset.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("CALL TRANSFORMATION with inline", () => {
    const abap = `
    CALL TRANSFORMATION id SOURCE data = 2 RESULT XML DATA(content).
    CLEAR content.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FOR IN voided", () => {
    const abap = `
    TYPES ty_integers TYPE STANDARD TABLE OF i WITH EMPTY KEY.
    DATA(lt_integers) = cl_void=>method( ).
    DATA(copy) = VALUE ty_integers( FOR lv_int IN lt_integers ( lv_int ) ).
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("WRITE syst-sysid.", () => {
    const abap = `WRITE syst-sysid.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("STATICS BEGIN INCLUDE", () => {
    const abap = `
  STATICS BEGIN OF bar.
  INCLUDE STRUCTURE syst.
  STATICS END OF bar.

  WRITE bar-sysid.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FAE, table_line", () => {
    const abap = `
    TYPES ty_char40 TYPE c LENGTH 40.
    DATA lt_sha1 TYPE STANDARD TABLE OF ty_char40 WITH EMPTY KEY.
    SELECT * FROM ags_objects
      INTO TABLE @DATA(rt_list)
      FOR ALL ENTRIES IN lt_sha1
      WHERE sha1 = lt_sha1-table_line.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0, issues[0]?.getMessage());
  });

  it("CONTROLS w_tabstrip TYPE TABSTRIP", () => {
    const abap = `
    CONTROLS w_tabstrip TYPE TABSTRIP.
    w_tabstrip-activetab = 'FOO'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("UPDATE database table with field reference", () => {
    const prog = `UPDATE ztab SET value1 = value1 + 1 WHERE field1 = 'abc'.`;
    const issues = runMulti([
      {filename: "ztab.tabl.xml", contents: ztab},
      {filename: "zfoobar.prog.abap", contents: prog},
    ]);
    expect(issues.length).to.equals(0);
  });

  it("concat_lines_of", () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF string.
    WRITE concat_lines_of( table = tab sep = | | ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("LET inside VALUE", () => {
    const abap = `
TYPES: BEGIN OF ty_distance,
  distance TYPE i,
END OF ty_distance.
DATA(parameters) = VALUE ty_distance( LET distance = 10 IN distance = distance ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("CONCATENATE LINES to inline", () => {
    const abap = `
    DATA lt_text TYPE STANDARD TABLE OF string.
    CONCATENATE LINES OF lt_text INTO DATA(lv_querystring) SEPARATED BY space.
    WRITE lv_querystring.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("line_exists(", () => {
    const abap = `
    DATA t_data TYPE STANDARD TABLE OF i.
    IF line_exists( t_data[ table_line = 2 ] ).
    ENDIF.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("condense() with del parameter", () => {
    const abap = `WRITE condense( val = |dsf| del = |\r| ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("CONTROLS TABLEVIEW", () => {
    const abap = `
    CONTROLS ctrl TYPE TABLEVIEW USING SCREEN '0002'.
    WRITE ctrl-current_line.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("TABBED BLOCK", () => {
    const abap = `
    SELECTION-SCREEN BEGIN OF TABBED BLOCK tabb FOR 20 LINES.
    SELECTION-SCREEN END OF BLOCK tabb.

    tabb-dynnr = 110.
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("APPEND INITIAL LINE with inline, void", () => {
    const abap = `
    DATA tab TYPE voided.
    APPEND INITIAL LINE TO tab ASSIGNING FIELD-SYMBOL(<ls_tab1>).
    WRITE <ls_tab1>.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FORM, TABLES with LIKE table typing", () => {
    const abap = `
TYPES: BEGIN OF ty_type,
         field TYPE string,
       END OF ty_type.

DATA tab TYPE STANDARD TABLE OF ty_type.

FORM foo TABLES bar LIKE tab.
  WRITE bar-field.
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("LIKE typing with header lines", () => {
    const abap = `
TYPES: BEGIN OF ty_type,
         field TYPE c LENGTH 1,
       END OF ty_type.

DATA tab1 TYPE ty_type OCCURS 0 WITH HEADER LINE.

DATA tab2 LIKE tab1 OCCURS 0 WITH HEADER LINE.

LOOP AT tab2.
  WRITE tab2-field.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("text elements, with text redefined", () => {
    const abap = `
  DATA text TYPE c LENGTH 1.
  WRITE TEXT-abc.
  WRITE text.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("LOOP AT simple select option", () => {
    const abap = `
  DATA var TYPE i.
  SELECT-OPTIONS foo FOR var.

  LOOP AT foo.
    WRITE foo-low.
  ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP AT select option", () => {
    const abap = `
TYPES: BEGIN OF ty_type,
         fieldname TYPE c LENGTH 10,
       END OF ty_type.

DATA bar TYPE STANDARD TABLE OF ty_type WITH HEADER LINE.

SELECT-OPTIONS foo FOR bar NO INTERVALS LOWER CASE.

LOOP AT foo.
  WRITE foo-low.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FORM with LIKE table body", () => {
    const abap = `
    DATA int TYPE i.
    RANGES foo FOR int.
    FORM name USING input LIKE foo[].
      LOOP AT input INTO DATA(d).
      ENDLOOP.
    ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("contains() with regex", () => {
    const abap = `
    IF contains( val = 'a' regex = 'a' ).
    ENDIF.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("macro call with dashes", () => {
    const abap = `
TYPES: BEGIN OF ty_type,
         field TYPE c,
       END OF ty_type.
DATA var TYPE ty_type.
DEFINE _foo.
  WRITE &1.
END-OF-DEFINITION.
_foo var-field.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("LIKE TABLE OF object reference", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    DATA foo TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.
DATA man    TYPE REF TO lcl_bar.
DATA it_lev LIKE TABLE OF man->foo.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("ENUM STRUCTURE", () => {
    const abap = `
TYPES:
  BEGIN OF ENUM te_content_type STRUCTURE content_type,
    right,
    target,
    left,
  END OF ENUM te_content_type STRUCTURE content_type.

DATA foo TYPE te_content_type.
foo = content_type-right.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CREATE OBJECT TYPE, not found", () => {
    const abap = `
DATA ref TYPE REF TO object.
CREATE OBJECT ref TYPE zcl_not_found.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("CREATE OBJECT TYPE, generic instantiation error", () => {
    const abap = `
DATA ref TYPE REF TO object.
CREATE OBJECT ref.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("NEW lcl_clas( )->settings", () => {
    const abap = `
CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    DATA:
      BEGIN OF settings READ-ONLY,
        field TYPE abap_bool,
      END OF settings.
ENDCLASS.
CLASS lcl_clas IMPLEMENTATION.
ENDCLASS.

DATA(bar) = NEW lcl_clas( )->settings.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("NEW lcl_clas( )->settings-field", () => {
    const abap = `
CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    DATA:
      BEGIN OF settings READ-ONLY,
        field TYPE abap_bool,
      END OF settings.
ENDCLASS.
CLASS lcl_clas IMPLEMENTATION.
ENDCLASS.

DATA(bar) = NEW lcl_clas( )->settings-field.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("ref via ->*", () => {
    const abap = `
  FIELD-SYMBOLS <table_structure> TYPE any.
  DATA dynamic_line TYPE REF TO data.
  CREATE DATA dynamic_line TYPE ('sdfds').
  ASSIGN dynamic_line->* TO <table_structure>.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("LOOP AT REFERENCE INTO", () => {
    const abap = `
TYPES: BEGIN OF ty_tab,
         text TYPE string,
       END OF ty_tab.
DATA lt_message TYPE STANDARD TABLE OF ty_tab.

LOOP AT lt_message REFERENCE INTO DATA(lr_message).
  WRITE lr_message->text.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("READ TABLE any, expect error", () => {
    const abap = `
  CLASS lcl_bar DEFINITION.
    PUBLIC SECTION.
      METHODS method IMPORTING act TYPE any.
  ENDCLASS.
  CLASS lcl_bar IMPLEMENTATION.
    METHOD method.
      FIELD-SYMBOLS <row1> TYPE any.
      READ TABLE act INDEX 1 ASSIGNING <row1>.
    ENDMETHOD.
  ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("READ INDEX TABLE INDEX, ok", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS method IMPORTING act TYPE any.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD method.
    FIELD-SYMBOLS <tab> TYPE INDEX TABLE.
    FIELD-SYMBOLS <row1> TYPE any.
    ASSIGN act TO <tab>.
    READ TABLE <tab> INDEX 1 ASSIGNING <row1>.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("DESCRIBE, variables not defined, expect error", () => {
    const abap = `DESCRIBE FIELD act TYPE type1.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("DESCRIBE, ok", () => {
    const abap = `
    DATA act TYPE i.
    DATA type1 TYPE c LENGTH 1.
    DESCRIBE FIELD act TYPE type1.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("No infer error for NEW#", () => {
    const abap = `
CLASS foo DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING foo TYPE REF TO foo.
ENDCLASS.

CLASS foo IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  foo=>bar( NEW #( ) ).
  foo=>bar( foo = NEW #( ) ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("No infer error for NEW #, called via NEW", () => {
    const abap = `
CLASS bar DEFINITION.
ENDCLASS.
CLASS bar IMPLEMENTATION.
ENDCLASS.

CLASS foo DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING bar TYPE REF TO bar.
ENDCLASS.

CLASS foo IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  NEW foo( bar = NEW #( ) ).
  NEW foo( NEW #( ) ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("NEW infer, voids", () => {
    const abap = `
    NEW cl_void( parameter = NEW #( ) ).
    NEW cl_void( NEW #( ) ).
    DATA foo TYPE REF TO cl_void.
    foo = NEW #( parameter = NEW #( ) ).
    foo = NEW #( NEW #( ) ).
    `;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("NEW data reference via class type", () => {
    const abap = `
CLASS foo DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty,
             moo TYPE i,
           END OF ty.
ENDCLASS.
CLASS foo IMPLEMENTATION.
ENDCLASS.
START-OF-SELECTION.
  DATA(structure) = NEW foo=>ty( moo = 2 ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("NEW data reference via interface type", () => {
    const abap = `
INTERFACE yif_foo.
    TYPES: BEGIN OF ty,
             moo TYPE i,
           END OF ty.
ENDINTERFACE.
START-OF-SELECTION.
  DATA(structure) = NEW yif_foo=>ty( moo = 2 ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("VALUE #, empty string", () => {
    const abap = `
    DATA result TYPE string.
    result = VALUE #( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("void method, value with row", () => {
    const abap = `cl_void=>method( VALUE #( ( row = 2 ) ) ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("NEW in structured data", () => {
    const abap = `
  CLASS lcl_bar DEFINITION.
  ENDCLASS.
  CLASS lcl_bar IMPLEMENTATION.
  ENDCLASS.

  FORM moo.
    TYPES: BEGIN OF ty_dict,
             rollname TYPE string,
             obj      TYPE REF TO lcl_bar,
           END OF ty_dict.

    DATA(ls_blah) = VALUE ty_dict(
        rollname = 'bar'
        obj      = NEW #( ) ).
  ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("raise exception type not found", () => {
    const abap = `RAISE EXCEPTION TYPE zcx_sdfdsfdsfdsdsf.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("raise exception type not found, but voided", () => {
    const abap = `RAISE EXCEPTION TYPE cx_foobar.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("raise exception", () => {
    const abap = `
    DATA lx_error TYPE REF TO cx_foobar.
    RAISE EXCEPTION lx_error.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("nested TYPES definition", () => {
    const abap = `
TYPES:
  BEGIN OF ty_result,
    ci_has_errors TYPE abap_bool,
    BEGIN OF statistics,
      duration_in_seconds TYPE i,
    END OF statistics,
  END OF ty_result.

DATA result TYPE ty_result.

WRITE result-statistics-duration_in_seconds.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("voided method call, should not give any error", () => {
    const abap = `
    DATA pv_error TYPE string.
    cl_document_bcs=>create_document( i_text = VALUE #( ( line = pv_error ) ) ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("aliased attribute", () => {
    const abap = `
  INTERFACE lif_ajson.
    DATA mt_json_tree TYPE string.
  ENDINTERFACE.

  CLASS lcl_ajson DEFINITION.
    PUBLIC SECTION.
      INTERFACES lif_ajson.
      ALIASES mt_json_tree FOR lif_ajson~mt_json_tree.
  ENDCLASS.

  CLASS lcl_ajson IMPLEMENTATION.
  ENDCLASS.

  FORM bar.
    DATA ajson TYPE REF TO lcl_ajson.
    WRITE ajson->mt_json_tree.
  ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("aliased method", () => {
    const abap = `
INTERFACE lif_ajson.
  METHODS method.
ENDINTERFACE.

CLASS lcl_ajson DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_ajson.
    ALIASES method FOR lif_ajson~method.
ENDCLASS.

CLASS lcl_ajson IMPLEMENTATION.
  METHOD lif_ajson~method.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  DATA ajson TYPE REF TO lcl_ajson.
  ajson->method( ).
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("test something", () => {
    const abap = `
INTERFACE lif_html.
  METHODS render.
ENDINTERFACE.

CLASS lcl_viewer DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS to_html RETURNING VALUE(ref) TYPE REF TO lif_html.
ENDCLASS.

CLASS lcl_viewer IMPLEMENTATION.
  METHOD to_html.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  lcl_viewer=>to_html( )->render( ).
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("interface implementing voided interface", () => {
    const abap = `INTERFACE zif_foobar PUBLIC.
      INTERFACES if_voided.
    ENDINTERFACE.`;
    const issues = runInterface(abap);
    expect(issues.length).to.equals(0);
  });

  it("interface implementing non-existing interface, expect error", () => {
    const abap = `INTERFACE zif_foobar PUBLIC.
      INTERFACES zif_error.
    ENDINTERFACE.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("dynamic call, no syntax error expected", () => {
    const abap = `
  DATA lv_lock TYPE string.
  CALL METHOD (lv_lock)=>enqueue.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("refer table type WITH HEADER LINE", () => {
    const abap = `
TYPES: BEGIN OF ty_foo,
         field TYPE string,
       END OF ty_foo.
TYPES ttyp TYPE STANDARD TABLE OF ty_foo.
DATA moo TYPE ttyp WITH HEADER LINE.

LOOP AT moo.
  WRITE moo-field.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("invalid type with WITH HEADER LINE", () => {
    const abap = `DATA moo TYPE i WITH HEADER LINE.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("MESSAGE WITH TEXT, on 702", () => {
    const abap = `MESSAGE e001(00) WITH TEXT-001.`;
    const issues = runProgram(abap, [], Version.v702);
    expect(issues.length).to.equals(0);
  });

  it("LOOP at list with header line", () => {
    const abap = `
  DATA list(250) OCCURS 0 WITH HEADER LINE.
  LOOP AT list.
    WRITE / list.
  ENDLOOP.`;
    const issues = runProgram(abap, [], Version.v702);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("TYPES with OCCURS", () => {
    const abap = `
    TYPES tab TYPE i OCCURS 150.
    DATA fieldtab TYPE tab WITH HEADER LINE.`;
    const issues = runProgram(abap, [], Version.v702);
    expect(issues.length).to.equals(0);
  });

  it("RAISE EXCEPTION must be a object reference", () => {
    const abap = `RAISE EXCEPTION 'A'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("RAISE EXCEPTION, ok, voided", () => {
    const abap = `
    DATA lx_root TYPE REF TO cx_root.
    RAISE EXCEPTION lx_root.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("RAISE EXCEPTION, error, generic", () => {
    const abap = `
FORM bar USING foo TYPE any.
  RAISE EXCEPTION foo.
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("setting data from interfaced interface", () => {
    const abap = `
INTERFACE if_node.
  DATA type TYPE i.
ENDINTERFACE.

INTERFACE if_open.
  INTERFACES if_node.
ENDINTERFACE.

CLASS lcl_open_node DEFINITION.
  PUBLIC SECTION.
    INTERFACES if_open.
    METHODS constructor.
ENDCLASS.

CLASS lcl_open_node IMPLEMENTATION.
  METHOD constructor.
    if_node~type = 2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("dereference and assignment of data ref", () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  DATA row LIKE LINE OF tab.
  DATA ref TYPE REF TO i.
  APPEND INITIAL LINE TO tab REFERENCE INTO ref.
  ref->* = 2.
  LOOP AT tab INTO row.
    WRITE row.
  ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("CALL METHOD voided", () => {
    const abap = `CALL METHOD cl_sdfdsf=>method.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("voided with header line", () => {
    const abap = `DATA fieldtab TYPE voidedvoid WITH HEADER LINE.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FIND with stuff after SUBMATCHES", () => {
    const abap = `
  DATA sdummy TYPE string.
  DATA lv_ticks TYPE string.
  DATA lv_offset TYPE string.
  FIND FIRST OCCURRENCE OF REGEX 'sdf' IN sdummy SUBMATCHES lv_ticks lv_offset IGNORING CASE.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FIND with stuff after SUBMATCHES, 2", () => {
    const abap = `
  DATA lv_line TYPE string.
  DATA lv_color TYPE string.
  FIND REGEX 'SDFDSFS' IN lv_line
            SUBMATCHES DATA(lv_count) lv_color
            MATCH OFFSET DATA(lv_offset)
            MATCH LENGTH DATA(lv_length).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("SELECT, FOR ALL ENTRIES with @me->", () => {
    const abap = `
CLASS ycl_test_linter DEFINITION.
  PUBLIC SECTION.
    TYPES:
      BEGIN OF output_dict,
             trkorr TYPE c LENGTH 4,
           END OF output_dict.
    DATA list TYPE STANDARD TABLE OF output_dict WITH EMPTY KEY.
    METHODS select.
ENDCLASS.

CLASS ycl_test_linter IMPLEMENTATION.
  METHOD select.
    SELECT field1, field2
      FROM voided
      FOR ALL ENTRIES IN @me->list
      WHERE ztest_lint_e070~trkorr = @me->list-trkorr
      INTO TABLE @DATA(master).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0, issues[0]?.getMessage());
  });

  it("MODIFY, expect database table not found", () => {
    const abap = `
  FIELD-SYMBOLS <bar> TYPE any.
  MODIFY ztab FROM @<bar>.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("ztab");
  });

  it("DELETE, expect database table not found", () => {
    const abap = `
  DELETE FROM ztab WHERE value1 = 'abc'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("ztab");
  });

  it("INSERT, expect database table not found", () => {
    const abap = `
  FIELD-SYMBOLS <bar> TYPE any.
  INSERT INTO ztab VALUES <bar>.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("ztab");
  });

  it("UPDATE, expect database table not found", () => {
    const abap = `
  UPDATE ztab SET value1 = 'abc' WHERE field1 = 'sdfs'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("ztab");
  });

  it("UPDATE, expect database table not found", () => {
    const abap = `
  DATA lt_sort TYPE TABLE OF dd03l.
  SELECT tabname
  INTO TABLE @DATA(lt_dd02l)
  FROM dd02l
  FOR ALL ENTRIES IN @lt_sort
  WHERE tabname = @lt_sort-tabname.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("CONVERT DATE inline", () => {
    const abap = `
DATA date TYPE d.
DATA time TYPE t.
DATA tz TYPE timezone.
CONVERT DATE date TIME time INTO TIME STAMP DATA(timestamp) TIME ZONE tz.
WRITE / timestamp.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("multiple inline field symbols, okay", () => {
    const abap = `
  TYPES ty_tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.
  DATA turtles TYPE ty_tab.
  DATA(new1) = VALUE ty_tab( FOR <x> IN turtles ( <x> ) ).
  DATA(new2) = VALUE ty_tab( FOR <x> IN turtles ( <x> ) ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("superclass with same private variable name", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PRIVATE SECTION.
    DATA bar TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.

CLASS lcl_foo DEFINITION INHERITING FROM lcl_bar.
  PRIVATE SECTION.
    DATA bar TYPE i.
ENDCLASS.
CLASS lcl_foo IMPLEMENTATION.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("multiple identical named DATA definitions", () => {
    const abap = `
DATA date TYPE d.
DATA date TYPE d.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("multiple identical named TYPE definitions", () => {
    const abap = `
  TYPES ty TYPE i.
  TYPES ty TYPE i.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("interface multiple identical named TYPE definitions", () => {
    const abap = `
    interface bar.
  TYPES: BEGIN OF bodyorgs_update_webhook_config,
           url TYPE string,
         END OF bodyorgs_update_webhook_config.
  TYPES: BEGIN OF bodyorgs_update_webhook_config,
           url TYPE string,
         END OF bodyorgs_update_webhook_config.
         endinterface.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("function group with local FORM", () => {
    const topabap = `FUNCTION-POOL ZFUGR1.`;
    const topxml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <PROGDIR>
        <NAME>LZFUGR1TOP</NAME>
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
    const saplabap = `INCLUDE LZFUGR1TOP.
    INCLUDE LZFUGR1UXX.`;
    const saplxml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <PROGDIR>
        <NAME>SAPLZFUGR1</NAME>
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
       <AREAT>test</AREAT>
       <INCLUDES>
        <SOBJ_NAME>LZFUGR1TOP</SOBJ_NAME>
        <SOBJ_NAME>SAPLZFUGR1</SOBJ_NAME>
       </INCLUDES>
       <FUNCTIONS>
        <item>
         <FUNCNAME>ZFUGR1_FM</FUNCNAME>
         <SHORT_TEXT>test</SHORT_TEXT>
        </item>
       </FUNCTIONS>
      </asx:values>
     </asx:abap>
    </abapGit>`;
    const functionabap = `FUNCTION zfugr1_fm.
      PERFORM local_form.
    ENDFUNCTION.
    FORM local_form.
    ENDFORM.`;
    const issues = runMulti([
      {filename: "zfugr1.fugr.lzfugr1top.abap", contents: topabap},
      {filename: "zfugr1.fugr.lzfugr1top.xml", contents: topxml},
      {filename: "zfugr1.fugr.saplzfugr1.abap", contents: saplabap},
      {filename: "zfugr1.fugr.saplzfugr1.xml", contents: saplxml},
      {filename: "zfugr1.fugr.xml", contents: fugrxml},
      {filename: "zfugr1.fugr.zfugr1_fm.abap", contents: functionabap}]);
    expect(issues.length).to.equals(0);
  });

  it("FUGR include INCLUDEd in PROG", () => {
    const topabap = `FUNCTION-POOL ZFUGR1.`;
    const topxml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <PROGDIR>
        <NAME>LZFUGR1TOP</NAME>
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
    const saplabap = `  INCLUDE lzfugr1top.
  INCLUDE lzfugr1uxx.
INCLUDE lzfugr1f01.`;
    const saplxml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <PROGDIR>
        <NAME>SAPLZFUGR1</NAME>
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
       <AREAT>test</AREAT>
       <INCLUDES>
        <SOBJ_NAME>LZFUGR1F01</SOBJ_NAME>
        <SOBJ_NAME>LZFUGR1TOP</SOBJ_NAME>
        <SOBJ_NAME>SAPLZFUGR1</SOBJ_NAME>
       </INCLUDES>
      </asx:values>
     </asx:abap>
    </abapGit>`;
    const f01abap = `FORM moo. ENDFORM.`;
    const f01xml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <PROGDIR>
        <NAME>LZFUGR1F01</NAME>
        <SUBC>I</SUBC>
        <APPL>S</APPL>
        <RLOAD>E</RLOAD>
        <UCCHECK>X</UCCHECK>
       </PROGDIR>
       <TPOOL>
        <item>
         <ID>R</ID>
         <ENTRY>Include LZFUGR1F01</ENTRY>
         <LENGTH>18</LENGTH>
        </item>
       </TPOOL>
      </asx:values>
     </asx:abap>
    </abapGit>`;
    const progabap = `REPORT zprog.
PERFORM moo.
INCLUDE lzfugr1f01.`;
    const issues = runMulti([
      {filename: "zfugr1.fugr.lzfugr1top.abap", contents: topabap},
      {filename: "zfugr1.fugr.lzfugr1top.xml", contents: topxml},
      {filename: "zfugr1.fugr.saplzfugr1.abap", contents: saplabap},
      {filename: "zfugr1.fugr.saplzfugr1.xml", contents: saplxml},
      {filename: "zfugr1.fugr.xml", contents: fugrxml},
      {filename: "zfugr1.fugr.lzfugr1f01.abap", contents: f01abap},
      {filename: "zfugr1.fugr.lzfugr1f01.xml", contents: f01xml},
      {filename: "zprog.prog.abap", contents: progabap}]);
    expect(issues.length).to.equals(0);
  });

  it("FORM name with dashes not found", () => {
    const abap = `PERFORM foo-bar.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("foo-bar");
  });

  it("voided table expression", () => {
    const abap = `
  DATA ref_scan_manager TYPE REF TO sdfsdfsd.
  DATA(back_structure) = ref_scan_manager->structures[ 2 ].
  DATA(sdfs) = ref_scan_manager->statements[ back_structure-stmnt_from ].
  WRITE sdfs.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FORM name with dashes found", () => {
    const abap = `
    FORM foo-bar.
    ENDFORM.
    PERFORM foo-bar.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("NEW class not found", () => {
    const abap = `NEW zcl_bar( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("NEW class not found, method call", () => {
    const abap = `NEW zcl_bar( )->method( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("zcl_bar");
  });

  it("NEW, voided", () => {
    const abap = `NEW cl_bar( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("NEW, voided, method call", () => {
    const abap = `NEW cl_bar( )->moo( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("INSERT INTO TABLE ASSIGNING inline", () => {
    const abap = `
DATA: BEGIN OF gs_data,
        name TYPE string,
      END OF gs_data.
DATA mt_data LIKE STANDARD TABLE OF gs_data WITH EMPTY KEY.
INSERT VALUE #( name = 'XYZ' ) INTO TABLE mt_data ASSIGNING FIELD-SYMBOL(<ls_data>).
WRITE <ls_data>-name.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("CLAS, INCLUDEs", () => {
    const clas = `CLASS zcl_inc DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS sdfds.
ENDCLASS.
CLASS ZCL_INC IMPLEMENTATION.
  METHOD sdfds.
    INCLUDE zincclas.
    moo = 2.
  ENDMETHOD.
ENDCLASS.`;
    const zincclas = `DATA moo TYPE i.`;
    const issues = runMulti([
      {filename: "zcl_inc.clas.abap", contents: clas},
      {filename: "zincclas.prog.abap", contents: zincclas},
      {filename: "zincclas.prog.xml", contents: "<SUBC>I</SUBC>"}]);
    expect(issues.length).to.equals(0);
  });

  it("function group with TABLES STRUCTURE parameter, voided type", () => {
    const topabap = `FUNCTION-POOL ZFUGR_TEST.`;
    const topxml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <PROGDIR>
        <NAME>LZFUGR_TESTTOP</NAME>
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
    const saplabap = `INCLUDE LZFUGR_TESTTOP.
    INCLUDE LZFUGR_TESTUXX.`;
    const saplxml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <PROGDIR>
        <NAME>SAPLZFUGR_TEST</NAME>
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
       <AREAT>test</AREAT>
       <INCLUDES>
        <SOBJ_NAME>LZFUGR_TESTTOP</SOBJ_NAME>
        <SOBJ_NAME>SAPLZFUGR_TEST</SOBJ_NAME>
       </INCLUDES>
       <FUNCTIONS>
        <item>
         <FUNCNAME>ZTABLSTRU</FUNCNAME>
         <SHORT_TEXT>test</SHORT_TEXT>
         <TABLES>
          <RSTBL>
           <PARAMETER>FOOBAR</PARAMETER>
           <DBSTRUCT>EDIDC</DBSTRUCT>
          </RSTBL>
         </TABLES>
        </item>
       </FUNCTIONS>
      </asx:values>
     </asx:abap>
    </abapGit>`;
    const functionabap = `FUNCTION ztablstru.
*"----------------------------------------------------------------------
*"*"Local Interface:
*"  TABLES
*"      FOOBAR STRUCTURE  EDIDC
*"----------------------------------------------------------------------

  WRITE foobar-docnum.

ENDFUNCTION.`;
    const issues = runMulti([
      {filename: "zfugr_test.fugr.lzfugr_testtop.abap", contents: topabap},
      {filename: "zfugr_test.fugr.lzfugr_testtop.xml", contents: topxml},
      {filename: "zfugr_test.fugr.saplzfugr_test.abap", contents: saplabap},
      {filename: "zfugr_test.fugr.saplzfugr_test.xml", contents: saplxml},
      {filename: "zfugr_test.fugr.xml", contents: fugrxml},
      {filename: "zfugr_test.fugr.ztablstru.abap", contents: functionabap}]);
    expect(issues.length).to.equals(0);
  });

  it("SELECT without INTO, implicit workarea not found", () => {
    const abap = `
    SELECT * FROM foobar WHERE field = 'bar'.
    ENDSELECT.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("SELECT without INTO, aggregation", () => {
    const abap = `SELECT COUNT(*) FROM tcdrp WHERE object = 2.
    SELECT COUNT( * ) FROM tcdrp WHERE object = 2.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("SELECT without INTO, aggregation 2", () => {
    const abap = `DATA lv_primary type string.
    data lv_where type string.
    SELECT COUNT(*) FROM (lv_primary) WHERE (lv_where).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("create voided object", () => {
    const abap = `
    DATA lo_zip TYPE REF TO cl_abap_zip.
    CREATE OBJECT lo_zip.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("create object, dynamic", () => {
    const abap = `
  DATA lo_manifest_provider TYPE REF TO object.
  DATA lv_dyn TYPE string.
  CREATE OBJECT lo_manifest_provider TYPE (lv_dyn).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("instantiate abstract, 1", () => {
    const abap = `
  CLASS vehicle DEFINITION ABSTRACT.
  ENDCLASS.
  CLASS vehicle IMPLEMENTATION.
  ENDCLASS.
  DATA my_car TYPE REF TO vehicle.
  CREATE OBJECT my_car TYPE vehicle.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("instantiate abstract, 2", () => {
    const abap = `
  CLASS vehicle DEFINITION ABSTRACT.
  ENDCLASS.
  CLASS vehicle IMPLEMENTATION.
  ENDCLASS.
  DATA my_car TYPE REF TO vehicle.
  CREATE OBJECT my_car.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("instantiate abstract, 3", () => {
    const abap = `
  CLASS vehicle DEFINITION ABSTRACT.
  ENDCLASS.
  CLASS vehicle IMPLEMENTATION.
  ENDCLASS.
  DATA my_car TYPE REF TO vehicle.
  my_car = NEW #( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("instantiate abstract, 4", () => {
    const abap = `
  CLASS vehicle DEFINITION ABSTRACT.
  ENDCLASS.
  CLASS vehicle IMPLEMENTATION.
  ENDCLASS.
  DATA my_car TYPE REF TO vehicle.
  my_car = NEW vehicle( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("ADD", () => {
    const abap = `
  DATA int TYPE i.
  ADD 2 TO int.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("CLOSE DATASET", () => {
    const abap = `DATA bar TYPE string.
    CLOSE DATASET bar.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("ELSEIF", () => {
    const abap = `IF 1 = 2.
    ELSEIF 3 = 4.
    ENDIF.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("dynamic INSERT, full errornamespace", () => {
    const abap = `FIELD-SYMBOLS <ls_table> TYPE any.
    DATA c_tabname TYPE string.
    INSERT (c_tabname) FROM <ls_table>.`;
    const issues = runProgram(abap, [], Version.v702, ".");
    expect(issues.length).to.equals(0);
  });

  it("dynamic DELETE, full errornamespace", () => {
    const abap = `DATA c_tabname TYPE string.
    DELETE FROM (c_tabname) WHERE type = 2.`;
    const issues = runProgram(abap, [], Version.v702, ".");
    expect(issues.length).to.equals(0);
  });

  it("dynamic MODIFY, full errornamespace, ls_content not found", () => {
    const abap = `DATA c_tabname TYPE string.
    FIELD-SYMBOLS <ls_table> TYPE any.
    MODIFY (c_tabname) FROM ls_content.`;
    const issues = runProgram(abap, [], Version.v702, ".");
    expect(issues.length).to.equals(1);
  });

  it("INCLUDE AS 1", () => {
    const abap = `
TYPES: BEGIN OF bar,
         field TYPE c LENGTH 1,
       END OF bar.
TYPES: BEGIN OF something,
         field1 TYPE c LENGTH 1.
         INCLUDE TYPE bar AS mo.
TYPES END OF something.
DATA moo TYPE something.
WRITE moo-field1.
WRITE moo-mo-field.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("INCLUDE AS 2", () => {
    const abap = `
TYPES: BEGIN OF bar,
         field TYPE c LENGTH 1,
       END OF bar.
TYPES: BEGIN OF something,
         field1 TYPE c LENGTH 1.
         INCLUDE TYPE bar AS mo.
TYPES END OF something.
DATA moo TYPE something.
WRITE moo-field.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("structure, duplicate field names", () => {
    const abap = `
TYPES: BEGIN OF main,
           foo TYPE i,
           foo TYPE i,
         END OF main.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("PROG includes from FUGR", () => {
    const d01abap = `DATA bar TYPE i.`;
    const d01xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>LZFUGR1D01</NAME>
    <SUBC>I</SUBC>
    <APPL>S</APPL>
    <RLOAD>E</RLOAD>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
   <TPOOL>
    <item>
     <ID>R</ID>
     <ENTRY>Include LZFUGR1D01</ENTRY>
     <LENGTH>18</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const topabap = `FUNCTION-POOL zfugr1.`;
    const topxml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>LZFUGR1TOP</NAME>
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
    INCLUDE LZFUGR1TOP.
    INCLUDE LZFUGR1UXX.
    INCLUDE LZFUGR1D01.`;
    const saplxml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>SAPLZFUGR1</NAME>
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
   <AREAT>test</AREAT>
   <INCLUDES>
    <SOBJ_NAME>LZFUGR1D01</SOBJ_NAME>
    <SOBJ_NAME>LZFUGR1TOP</SOBJ_NAME>
    <SOBJ_NAME>SAPLZFUGR1</SOBJ_NAME>
   </INCLUDES>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const progabap = `INCLUDE lzfugr1d01.
    WRITE bar.`;
    const issues = runMulti([
      {filename: "zfugr1.fugr.lzfugr1d01.abap", contents: d01abap},
      {filename: "zfugr1.fugr.lzfugr1d01.xml", contents: d01xml},
      {filename: "zfugr1.fugr.lzfugr1top.abap", contents: topabap},
      {filename: "zfugr1.fugr.lzfugr1top.xml", contents: topxml},
      {filename: "zfugr1.fugr.saplzfugr1.abap", contents: saplabap},
      {filename: "zfugr1.fugr.saplzfugr1.xml", contents: saplxml},
      {filename: "zfugr1.fugr.xml", contents: fugrxml},
      {filename: "zfugr1.prog.abap", contents: progabap}]);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("private types from superclass should not be inherited", () => {
    const abap = `
CLASS top DEFINITION.
  PRIVATE SECTION.
    TYPES ty TYPE c LENGTH 1.
ENDCLASS.
CLASS top IMPLEMENTATION.
ENDCLASS.

CLASS sub DEFINITION INHERITING FROM top.
  PRIVATE SECTION.
    TYPES ty TYPE c LENGTH 1.
ENDCLASS.
CLASS sub IMPLEMENTATION.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("testclass referencing friended type", () => {
    const test = `
    CLASS ltcl_syntax_cases DEFINITION DEFERRED.
    CLASS zcl_sdfsdf DEFINITION LOCAL FRIENDS ltcl_syntax_cases.

    CLASS ltcl_syntax_cases DEFINITION FINAL FOR TESTING RISK LEVEL HARMLESS DURATION SHORT.
      PRIVATE SECTION.
        DATA: mt_after_parse TYPE zcl_sdfsdf=>ty_match_tt.
    ENDCLASS.
    CLASS ltcl_syntax_cases IMPLEMENTATION.
    ENDCLASS.`;
    const clas = `
    CLASS zcl_sdfsdf DEFINITION PUBLIC.
      PROTECTED SECTION.
        TYPES:
          BEGIN OF ty_match,
            text_tag TYPE string,
          END OF ty_match .
        TYPES:
          ty_match_tt TYPE STANDARD TABLE OF ty_match WITH DEFAULT KEY.
    ENDCLASS.
    CLASS zcl_sdfsdf IMPLEMENTATION.
    ENDCLASS.`;
    const issues = runMulti([
      {filename: "zcl_sdfsdf.clas.abap", contents: clas},
      {filename: "zcl_sdfsdf.clas.testclasses.abap", contents: test}]);
    expect(issues.length).to.equals(0);
  });

  it("CONCATENATE, use before decl", () => {
    const abap = `CONCATENATE lv_str 'foobar' INTO DATA(lv_str) SEPARATED BY space.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("DESCRIBE FIELD, inline", () => {
    const abap = `
  FIELD-SYMBOLS <bar> TYPE any.
  DESCRIBE FIELD <bar> LENGTH DATA(len) IN CHARACTER MODE.
  WRITE len.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FORMAT COLOR COL_NEGATIVE INVERSE INTENSIFIED.", () => {
    const abap = `FORMAT COLOR COL_NEGATIVE INVERSE INTENSIFIED.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("FORM, VALUE() STRUCTURE", () => {
    const abap = `DATA: BEGIN OF gs_data,
        field TYPE i,
      END OF gs_data.

FORM name USING VALUE(input) STRUCTURE gs_data.
  WRITE input-field.
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("Refer to CONSTANTS from TYPE POOL", () => {
    const pool = `
    TYPE-POOL zfoo.
    CONSTANTS zfoo_moo TYPE c LENGTH 6 VALUE 'foobar'.`;
    const prog = `WRITE zfoo_moo.`;
    const issues = runMulti([
      {filename: "zfoo.type.abap", contents: pool},
      {filename: "zreport.prog.abap", contents: prog}]);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("REDUCE with INDEX INTO", () => {
    const abap = `
    TYPES ty_t_coefficients TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    DATA it_coefficients TYPE ty_t_coefficients.
    DATA mv_number TYPE c LENGTH 10.
    DATA(rv_val) = REDUCE i( INIT n = 0
                           FOR coef IN it_coefficients
                           INDEX INTO lv_idx
                           LET lv_pos = lv_idx - 1
                           IN NEXT n = n + coef * mv_number+lv_pos(1) ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("SELECT, multiple inline data definitions", () => {
    const abap = `
SELECT SINGLE field1, field2
  FROM voided
  INTO ( @DATA(lv_field1), @DATA(lv_field2) ).
WRITE lv_field1.
WRITE lv_field2.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("Less strict handling of constant values", () => {
    const abap = `CONSTANTS bar TYPE if_sxml_node=>node_type VALUE if_sxml_node=>co_nt_final.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("Less strict handling of constant values, error, not voided", () => {
    const abap = `CONSTANTS bar TYPE c VALUE zerror=>co.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("Less strict handling of constant values, error if undefined is used for length", () => {
    const abap = `
    CONSTANTS bar TYPE if_sxml_node=>node_type VALUE if_sxml_node=>co_nt_final.
    CONSTANTS moo TYPE c LENGTH bar VALUE 'A'.`;
    const issues = runProgram(abap);
    // todo, this should be an error?
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("FORM type, refer LIKE LINE", () => {
    const abap = `
DATA: BEGIN OF gi_order OCCURS 0,
        date TYPE d,
      END OF gi_order.

FORM block_log USING order LIKE LINE OF gi_order.
  WRITE order-date.
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("contains() is voided, not builtin", () => {
    const abap = `
    DATA lv_str TYPE string.
    cl_abap_matcher=>contains( pattern = 'abc' text = lv_str ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("call strlen()", () => {
    const abap = `
    DATA(len) = strlen( |abc| ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("call strlen(), 2", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS m1.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD m1.
    DATA(len) = strlen( |abc| ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("FORM, TABLES", () => {
    const abap = `
TYPES: BEGIN OF ty,
         id TYPE i,
       END OF ty.
TYPES typ TYPE STANDARD TABLE OF ty WITH EMPTY KEY.

FORM ok TABLES bar TYPE typ.
  WRITE bar[ 1 ]-id.
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("Double interface implementation, ok", () => {
    const abap = `
INTERFACE top.
  DATA bar TYPE c LENGTH 1.
ENDINTERFACE.

INTERFACE sub.
  INTERFACES top.
ENDINTERFACE.

CLASS bar DEFINITION.
  PUBLIC SECTION.
    INTERFACES top.
    INTERFACES sub.
ENDCLASS.
CLASS bar IMPLEMENTATION.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("Double interface implementation, ok, 2", () => {
    const abap = `
INTERFACE if_singleton.
  DATA bar TYPE c LENGTH 1.
ENDINTERFACE.

INTERFACE if_new.
  INTERFACES if_singleton.
ENDINTERFACE.

CLASS cl_base DEFINITION ABSTRACT.
  PUBLIC SECTION.
    INTERFACES if_singleton.
ENDCLASS.
CLASS cl_base IMPLEMENTATION.
ENDCLASS.

CLASS cl_new DEFINITION INHERITING FROM cl_base.
  PUBLIC SECTION.
    INTERFACES if_new.
ENDCLASS.
CLASS cl_new IMPLEMENTATION.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("Double interface implementation, ok, 3", () => {
    const abap = `
INTERFACE if_singleton.
  DATA bar TYPE c LENGTH 1.
ENDINTERFACE.

INTERFACE if_level.
  INTERFACES if_singleton.
ENDINTERFACE.

INTERFACE if_new.
  INTERFACES if_level.
ENDINTERFACE.

CLASS cl_base DEFINITION ABSTRACT.
  PUBLIC SECTION.
    INTERFACES if_level.
ENDCLASS.
CLASS cl_base IMPLEMENTATION.
ENDCLASS.

CLASS cl_new DEFINITION INHERITING FROM cl_base.
  PUBLIC SECTION.
    INTERFACES if_new.
ENDCLASS.
CLASS cl_new IMPLEMENTATION.
ENDCLASS.
    `;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("Double interface implementation, ok, 4", () => {
    const abap = `
INTERFACE if_singleton.
  DATA bar TYPE i.
ENDINTERFACE.

INTERFACE if_controller.
  INTERFACES if_singleton.
ENDINTERFACE.

INTERFACE if_new.
  INTERFACES if_singleton.
  INTERFACES if_controller.
ENDINTERFACE.

CLASS cl_new DEFINITION.
  PUBLIC SECTION.
    INTERFACES if_new.
ENDCLASS.
CLASS cl_new IMPLEMENTATION.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("FIND FIRST inline RESULTS", () => {
    const abap = `
  DATA lv_last TYPE string.
  FIND FIRST OCCURRENCE OF 'sdf' IN lv_last RESULTS DATA(ls_len).
  WRITE ls_len-offset.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("Cannot move char into tab", () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  tab = '2'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("Incompatible");
  });

  it("Cannot move char into ref", () => {
    const abap = `
    DATA ref TYPE REF TO object.
    ref = '2'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("Incompatible");
  });

  it("Ok move, header line", () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF i WITH HEADER LINE.
  tab = 2.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FORM, untyped USING parameter, ok", () => {
    const abap = `
    FORM sdfsd USING p_sdfsd.
      DATA lt TYPE TABLE OF void.
      lt = p_sdfsd.
    ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FORM, untyped CHANGING parameter, ok", () => {
    const abap = `
    FORM sdfsd CHANGING p_sdfsd.
      DATA lt TYPE TABLE OF void.
      lt = p_sdfsd.
    ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("Move int to structure not possible", () => {
    const abap = `
TYPES:
  BEGIN OF ts_str,
    comp_one TYPE i,
  END OF ts_str.
DATA lv_int1 TYPE i VALUE 1.
DATA lv_str TYPE ts_str.
MOVE lv_int1 TO lv_str.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
  });

  it("Move string to charlike structre, ok", () => {
    const abap = `
  DATA iv_msg TYPE string.
  DATA:
    BEGIN OF ls_msg,
      a1 TYPE c LENGTH 50,
      a2 TYPE c LENGTH 50,
    END OF ls_msg.

  ls_msg = iv_msg.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("Move string to hexlike structure, not ok", () => {
    const abap = `
DATA iv_msg TYPE string.
DATA: BEGIN OF ls_msg,
        a1 TYPE x LENGTH 50,
        a2 TYPE x LENGTH 50,
      END OF ls_msg.
ls_msg = iv_msg.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
  });

  it("string to xstring, and xstring to string, ok", () => {
    const abap = `
  DATA hex TYPE xstring.
  DATA char TYPE string.
  hex = char.
  char = hex.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, integer to voided structure", () => {
    const abap = `
    TYPES:
    BEGIN OF st_sequence,
      field1 TYPE foo,
      field2 TYPE bar,
    END OF st_sequence.
  DATA l_seq TYPE st_sequence.
  l_seq = sy-tabix.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, string to numc", () => {
    const abap = `
  DATA: BEGIN OF bar,
  foo TYPE n LENGTH 5,
END OF bar.
DATA lv_str TYPE string.
bar = lv_str.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, to table body", () => {
    const abap = `
DATA: li_data TYPE TABLE OF string.
DATA: BEGIN OF lines OCCURS 1,
        txt(1000),
      END OF lines.
lines[] = li_data.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, table body to table body", () => {
    const abap = `
DATA: li_data TYPE TABLE OF string.
DATA: BEGIN OF lines OCCURS 1,
        txt(1000),
      END OF lines.
lines[] = li_data[].`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("error, table body to table header", () => {
    const abap = `
DATA: li_data TYPE TABLE OF string.
DATA: BEGIN OF lines OCCURS 1,
        txt(1000),
      END OF lines.
lines = li_data[].`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
  });

  it("ok, data references and fs", () => {
    const abap = `
TYPES: BEGIN OF ty_bar,
         field TYPE i,
       END OF ty_bar.
DATA er_entity TYPE REF TO ty_bar.
DATA ls_entity TYPE ty_bar.
CREATE DATA er_entity TYPE ty_bar.
ASSIGN er_entity->* TO FIELD-SYMBOL(<ls_entity>).
<ls_entity> = ls_entity.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, clear voided table body", () => {
    const abap = `
  DATA msg TYPE voided.
  CLEAR msg[].`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, date to structure", () => {
    const abap = `
DATA: BEGIN OF l_new_date,
        year(4),
        month(2),
        day(2),
      END OF l_new_date.
DATA l_call_date LIKE sy-datum.
l_new_date = l_call_date.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, char to structure with packed", () => {
    const abap = `
DATA: BEGIN OF g_item_tab OCCURS 0,
        ssdf    TYPE c LENGTH 1,
        days(5) TYPE p,
      END OF g_item_tab.
g_item_tab = ' '.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, clike to structure", () => {
    const abap = `
  FIELD-SYMBOLS <fs> TYPE clike.
  DATA: BEGIN OF ls_key,
          foo TYPE c LENGTH 10,
        END OF ls_key.
  ls_key = <fs>.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, enum default in interface method definition", () => {
    const abap = `
INTERFACE lif_enum_test.
  TYPES:
    BEGIN OF ENUM mode,
      value1,
      value2,
    END OF ENUM mode.

  METHODS:
    blah
      IMPORTING mode TYPE mode DEFAULT value1.
ENDINTERFACE.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, loop group by, with inlines", () => {
    const abap = `
TYPES: BEGIN OF ty_line,
         moo         TYPE string,
         author      TYPE string,
         author_name TYPE string,
       END OF ty_line.

DATA t_line TYPE STANDARD TABLE OF ty_line WITH EMPTY KEY.

LOOP AT t_line ASSIGNING FIELD-SYMBOL(<s_line>)
 GROUP BY ( author = <s_line>-author name = <s_line>-author_name )
          ASSIGNING FIELD-SYMBOL(<t_group>).
  WRITE <t_group>-author.
  WRITE <s_line>-moo.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, loop group by, with inlines, 2", () => {
    const abap = `
TYPES: BEGIN OF ty_line,
         author         TYPE string,
         author_name    TYPE string,
       END OF ty_line.

DATA t_line TYPE STANDARD TABLE OF ty_line WITH EMPTY KEY.

LOOP AT t_line ASSIGNING FIELD-SYMBOL(<s_line>)
    GROUP BY ( author = <s_line>-author name = <s_line>-author_name )
    ASSIGNING FIELD-SYMBOL(<t_group>).
  LOOP AT GROUP <t_group> ASSIGNING <s_line> WHERE author = <s_line>-author.
  ENDLOOP.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("infer type, INSERT INTO TABLE, NEW #", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD bar.
    DATA tab TYPE STANDARD TABLE OF REF TO lcl WITH EMPTY KEY.
    INSERT NEW #( ) INTO TABLE tab.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("cyclic referenced global interfaces", () => {
    const intf1 = `INTERFACE zintf1 PUBLIC.
  METHODS blah
    IMPORTING
      iv TYPE c DEFAULT zintf2=>co_true.
ENDINTERFACE.`;
    const intf2 = `INTERFACE zintf2 PUBLIC.
  INTERFACES zintf1.
  CONSTANTS co_true TYPE c LENGTH 1 VALUE 'X'.
ENDINTERFACE.`;
    const issues = runMulti([
      {filename: "zintf1.intf.abap", contents: intf1},
      {filename: "zintf2.intf.abap", contents: intf2},
    ]);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("cyclic referenced global interfaces, 2", () => {
    const intf1 = `INTERFACE zintf1 PUBLIC.
  CONSTANTS:
    BEGIN OF gc_type,
      tile TYPE string VALUE zintf2=>co_true,
    END OF gc_type.
ENDINTERFACE.`;
    const intf2 = `INTERFACE zintf2 PUBLIC.
  INTERFACES zintf1.
  CONSTANTS co_true TYPE string VALUE 'X'.
ENDINTERFACE.`;
    const issues = runMulti([
      {filename: "zintf1.intf.abap", contents: intf1},
      {filename: "zintf2.intf.abap", contents: intf2},
    ]);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("method lif1~foo( ) not relevant for the reference", () => {
    const abap = `
INTERFACE lif1.
  METHODS foo.
ENDINTERFACE.

INTERFACE lif2.
  METHODS bar.
ENDINTERFACE.

CLASS bar DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.

CLASS bar IMPLEMENTATION.
  METHOD run.
    DATA ref TYPE REF TO lif2.
    ref->bar( ).
    ref->lif1~foo( ). " <- this should be a syntax error
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include(`Method "lif1~foo" not found`);
  });

  it("check constructor parameters, ok, case and exclamation", () => {
    const abap = `
CLASS bar DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING !IV_bar TYPE i.
    METHODS run.
ENDCLASS.

CLASS bar IMPLEMENTATION.
  METHOD constructor.
    RETURN.
  ENDMETHOD.
  METHOD run.
    DATA ref TYPE REF TO bar.
    CREATE OBJECT ref
      EXPORTING
        iv_bar = 2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("check constructor parameters, parameter not found", () => {
    const abap = `
CLASS bar DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.

CLASS bar IMPLEMENTATION.
  METHOD run.
    DATA ref TYPE REF TO bar.
    CREATE OBJECT ref
      EXPORTING
        iv_bar = 2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include(`IV_BAR`);
  });

  it("check constructor parameters, parameter not found, with TYPE", () => {
    const abap = `
CLASS bar DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.

CLASS bar IMPLEMENTATION.
  METHOD run.
    DATA ref TYPE REF TO object.
    CREATE OBJECT ref TYPE bar
      EXPORTING
        iv_bar = 2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include(`IV_BAR`);
  });

  it("check constructor parameters, wrong parameter name", () => {
    const abap = `
CLASS bar DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING moo TYPE i.
    METHODS run.
ENDCLASS.

CLASS bar IMPLEMENTATION.
  METHOD run.
    DATA ref TYPE REF TO object.
    CREATE OBJECT ref TYPE bar
      EXPORTING
        iv_bar = 2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include(`IV_BAR`);
  });

  it("check constructor parameters, parameter must be supplied", () => {
    const abap = `
CLASS bar DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING moo TYPE i.
    METHODS run.
ENDCLASS.

CLASS bar IMPLEMENTATION.
  METHOD run.
    DATA ref TYPE REF TO object.
    CREATE OBJECT ref TYPE bar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include(`MOO`);
  });

  it("check constructor parameters, from super class", () => {
    const abap = `
CLASS sup DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING bar TYPE i.
ENDCLASS.
CLASS sup IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.

CLASS sub DEFINITION INHERITING FROM sup.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS sub IMPLEMENTATION.
  METHOD run.
    DATA ref TYPE REF TO sub.
    CREATE OBJECT ref
      EXPORTING
        bar = 2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("check constructor parameters, pick the right constructor", () => {
    const abap = `
CLASS sup DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING bar TYPE i.
ENDCLASS.
CLASS sup IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.

CLASS sub DEFINITION INHERITING FROM sup.
  PUBLIC SECTION.
    METHODS constructor IMPORTING moo TYPE i.
    METHODS run.
ENDCLASS.
CLASS sub IMPLEMENTATION.
  METHOD constructor.
    super->constructor( bar = moo ).
  ENDMETHOD.
  METHOD run.
    DATA ref TYPE REF TO sup.
    CREATE OBJECT ref TYPE sub
      EXPORTING
        moo = 2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("method parameter must be supplied", () => {
    const abap = `
CLASS bar DEFINITION.
  PUBLIC SECTION.
    METHODS moo IMPORTING
      val TYPE i
      req TYPE i.
    METHODS run.
ENDCLASS.

CLASS bar IMPLEMENTATION.
  METHOD run.
    moo( val = 2 ).
  ENDMETHOD.
  METHOD moo.
    RETURN.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include(`REQ`);
  });

  it("method parameter must be supplied, none", () => {
    const abap = `
CLASS bar DEFINITION.
  PUBLIC SECTION.
    METHODS moo IMPORTING req TYPE i.
    METHODS run.
ENDCLASS.

CLASS bar IMPLEMENTATION.
  METHOD run.
    moo( ).
  ENDMETHOD.
  METHOD moo.
    RETURN.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include(`req`);
  });

  it("method CHANGING parameter must be supplied", () => {
    const abap = `
CLASS bar DEFINITION.
  PUBLIC SECTION.
    METHODS run.
    METHODS call CHANGING bar TYPE i.
ENDCLASS.

CLASS bar IMPLEMENTATION.
  METHOD call.
    RETURN.
  ENDMETHOD.

  METHOD run.
    call( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include(`bar`);
  });

  it("method call, ok, with importing and changing", () => {
    const abap = `
CLASS bar DEFINITION.
  PUBLIC SECTION.
    METHODS run.
    METHODS call
      IMPORTING moo TYPE i
      CHANGING bar TYPE i.
ENDCLASS.

CLASS bar IMPLEMENTATION.
  METHOD call.
    RETURN.
  ENDMETHOD.

  METHOD run.
    data val type i.
    call(
      exporting moo = 2
      changing bar = val ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("value passed to method parameter is not compatible", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS run IMPORTING index TYPE REF TO i.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD run.
    run( 1 ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal("Method parameter type not compatible");
  });

  it("READ TABLE without target and header line", () => {
    const abap = `
    DATA ii_node TYPE REF TO if_ixml_node.
    DATA mt_list TYPE STANDARD TABLE OF REF TO if_ixml_node WITH DEFAULT KEY.
    READ TABLE mt_list WITH KEY table_line = ii_node.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal("READ TABLE, define INTO or TRANSPORTING NO FIELDS");
  });

  it("READ TABLE TRANSPORTING NO FIELDS, ok", () => {
    const abap = `
    DATA ii_node TYPE REF TO if_ixml_node.
    DATA mt_list TYPE STANDARD TABLE OF REF TO if_ixml_node WITH DEFAULT KEY.
    READ TABLE mt_list WITH KEY table_line = ii_node TRANSPORTING NO FIELDS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("READ TABLE, INDEX should be simple", () => {
    const abap = `
  DATA mt_list TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  DATA index TYPE REF TO i.
  READ TABLE mt_list INDEX index TRANSPORTING NO FIELDS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal("READ TABLE, INDEX must be simple");
  });

  it("READ TABLE, table_line, ok", () => {
    const abap = `
  DATA lt_body TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  READ TABLE lt_body WITH KEY table_line = 'foobar' TRANSPORTING NO FIELDS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("field BLAH is not part of structure", () => {
    const abap = `
TYPES: BEGIN OF ty_bar,
    tag TYPE string,
  END OF ty_bar.
DATA lt_map TYPE STANDARD TABLE OF ty_bar.
DATA iv_tag TYPE string.
READ TABLE lt_map WITH KEY blah = iv_tag TRANSPORTING NO FIELDS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(`Component "blah" not found in structure`);
  });

  it("field MOO is not part of structure", () => {
    const abap = `
  FIELD-SYMBOLS <bar> TYPE ANY TABLE.
  READ TABLE <bar> WITH KEY moo = 2 TRANSPORTING NO FIELDS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(`ComponentChain, not a structure, AnyType`);
  });

  it("shift in byte mode should produce syntax error", () => {
    const abap = `
    DATA lv_temp TYPE string.
    SHIFT lv_temp BY 1 PLACES LEFT IN BYTE MODE.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(`Shift, Target not hex like`);
  });

  it("shift in byte mode, ok", () => {
    const abap = `
    DATA lv_temp TYPE xstring.
    SHIFT lv_temp BY 1 PLACES LEFT IN BYTE MODE.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("sy-pdest", () => {
    const abap = `
    WRITE sy-pdest.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, read structured table with table_line", () => {
    const abap = `
TYPES: BEGIN OF ty_tab,
  a TYPE string,
  b TYPE string,
  END OF ty_tab.
DATA itab TYPE TABLE OF ty_tab.
DATA wa TYPE ty_tab.
READ TABLE itab TRANSPORTING NO FIELDS WITH TABLE KEY table_line = wa.
IF sy-subrc = 0.
  WRITE 'FOUND'.
ENDIF.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, infer type from dynamic chain", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
    ASSIGN me->('foo') TO FIELD-SYMBOL(<bar>).
    <bar> = abap_true.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, csequence is char like", () => {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    METHODS test EXPORTING ev_foo TYPE csequence.
ENDCLASS.
CLASS lcl_foobar IMPLEMENTATION.
  METHOD test.
    SHIFT ev_foo LEFT DELETING LEADING space.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("expect error, field not in structure", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_type,
             field TYPE i,
           END OF ty_type.
    METHODS run.
    METHODS bar IMPORTING foo TYPE ty_type.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD run.
    bar( VALUE #( something_very_wrong_bad = 2 ) ).
  ENDMETHOD.

  METHOD bar.
    RETURN.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("something_very_wrong_bad");
  });

  it("expect error, parameter not supplied in constructor call, via NEW", () => {
    const abap = `
CLASS lcl_stream DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING iv_str TYPE string.
    METHODS take_matching RETURNING VALUE(ro_stream) TYPE REF TO lcl_stream.
ENDCLASS.

CLASS lcl_stream IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.

  METHOD take_matching.
    ro_stream = NEW #( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("must be supplied");
  });

  it("local friends", () => {
    const abap = `
  CLASS ltcl_find_prefix DEFINITION DEFERRED.
  CLASS zcl_oapi_main DEFINITION LOCAL FRIENDS ltcl_find_prefix.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0]?.getMessage()).to.contain("Class ZCL_OAPI_MAIN not found");
  });

  it("CALL METHOD, expect method not found error", () => {
    const abap = `
  CLASS lcl_bar DEFINITION.
  ENDCLASS.
  CLASS lcl_bar IMPLEMENTATION.
  ENDCLASS.

  DATA out TYPE REF TO lcl_bar.
  CALL METHOD out->something( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0]?.getMessage().toUpperCase()).to.contain("SOMETHING");
  });

  it("unassign, field not found", () => {
    const abap = "UNASSIGN <foobar>.";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("<foobar>");
  });

  it("GET CURSOR FIELD, field not found", () => {
    const abap = "GET CURSOR FIELD result.";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("result");
  });

  it("deep structure in value assignment", () => {
    const abap = `
TYPES:
  BEGIN OF ty_foo,
    BEGIN OF a,
      c TYPE c,
      i TYPE i,
    END OF a,
  END OF ty_foo.
DATA(ls_foo) = VALUE ty_foo( a-c = 'X' ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("static method cannot access instance variables, expect error", () => {
    const abap = `
CLASS lcl_poc DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS publish.
  PRIVATE SECTION.
    DATA gv_token TYPE string.
    CLASS-DATA var TYPE string.
ENDCLASS.

CLASS lcl_poc IMPLEMENTATION.
  METHOD publish.
    WRITE gv_token.
    WRITE var.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    const message = issues[0]?.getMessage();
    expect(message).to.not.equal(undefined);
    expect(message).to.contain("gv_token");
  });

  it("shadowing parameter, ok", () => {
    const abap = `
CLASS lcl_poc DEFINITION.
  PUBLIC SECTION.
    DATA var TYPE string.
    METHODS publish IMPORTING var TYPE i.
ENDCLASS.

CLASS lcl_poc IMPLEMENTATION.
  METHOD publish.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("shadowing, ok", () => {
    const abap = `
CLASS lcl_poc DEFINITION.
  PUBLIC SECTION.
    DATA var TYPE string.
    METHODS publish.
ENDCLASS.

CLASS lcl_poc IMPLEMENTATION.
  METHOD publish.
    DATA var TYPE string.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("LIKE variable that is not visible, ok", () => {
    const abap = `
CLASS lcl_poc DEFINITION.
  PRIVATE SECTION.
    DATA var TYPE string.
    CLASS-METHODS publish.
ENDCLASS.

CLASS lcl_poc IMPLEMENTATION.
  METHOD publish.
    DATA foo LIKE var.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it.skip("Error, overlapping names", () => {
    const abap = `
CLASS lcl_poc DEFINITION.
  PRIVATE SECTION.
    TYPES var TYPE i.
    DATA var TYPE string.
ENDCLASS.

CLASS lcl_poc IMPLEMENTATION.
ENDCLASS.`;
    const issues = runProgram(abap);
    const message = issues[0]?.getMessage();
    expect(message).to.not.equal(undefined);
    expect(message).to.contain("var");
  });

  it("Infer type, READ TABLE REFERENCE INTO", () => {
    const abap = `
TYPES: BEGIN OF ty_node,
         index TYPE i,
       END OF ty_node.
DATA lt_new_nodes TYPE STANDARD TABLE OF ty_node WITH EMPTY KEY.
READ TABLE lt_new_nodes INDEX 1 REFERENCE INTO DATA(lr_new_node).
lr_new_node->index = 1.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("access static variable from interface in static method, ok", () => {
    const abap = `
INTERFACE lif.
  CLASS-DATA foobar TYPE i.
ENDINTERFACE.

CLASS foo DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
    CLASS-METHODS bar.
ENDCLASS.

CLASS foo IMPLEMENTATION.
  METHOD bar.
    WRITE lif~foobar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("SELECT UNION, voided tables", () => {
    const abap = `
  SELECT field1 FROM foo
  UNION
  SELECT field1 FROM bar
  INTO TABLE @DATA(lt_event).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it.skip("access instance variable from interface in static method, error", () => {
    const abap = `
INTERFACE lif.
  DATA foobar TYPE i.
ENDINTERFACE.

CLASS foo DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
    CLASS-METHODS bar.
ENDCLASS.

CLASS foo IMPLEMENTATION.
  METHOD bar.
    WRITE lif~foobar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    const message = issues[0]?.getMessage();
    expect(message).to.not.equal(undefined);
    expect(message).to.contain("foobar");
  });

  it("cyclic constant to the interface itself", () => {
    const abap = `
INTERFACE lif_bar.
  CONSTANTS err TYPE i VALUE 1.
  CONSTANTS std TYPE i VALUE lif_bar=>err.
ENDINTERFACE.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("ENUM structure, ok", () => {
    const abap = `
  TYPES ty_object_type TYPE c LENGTH 4.
  TYPES:
    BEGIN OF ENUM ty_foo STRUCTURE unit BASE TYPE ty_object_type,
      invalid VALUE IS INITIAL,
      class   VALUE 'CLAS',
    END OF ENUM ty_foo STRUCTURE unit.
  TYPES:
    BEGIN OF ENUM ty_bar STRUCTURE kind BASE TYPE ty_object_type,
      invalid VALUE IS INITIAL,
      method  VALUE 'METH',
    END OF ENUM ty_bar STRUCTURE kind.
  DATA foo TYPE ty_foo.
  WRITE unit-invalid.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("CREATE OBJECT, allow ANY", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS foo CHANGING co_object TYPE any.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD foo.
    CREATE OBJECT co_object TYPE ('sdfsd').
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("Two class definitions with same name", () => {
    const abap = `
CLASS lcl_in DEFINITION.
ENDCLASS.
CLASS lcl_in IMPLEMENTATION.
ENDCLASS.

CLASS lcl_in DEFINITION.
ENDCLASS.
CLASS lcl_in IMPLEMENTATION.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.include("already defined");
  });

  it("Read simple table into ref, expect syntax error", () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA ref TYPE REF TO object.
  READ TABLE tab INTO ref INDEX 1.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("Incompatible");
  });

  it("Read table, ok", () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  DATA ref TYPE i.
  READ TABLE tab INTO ref INDEX 1.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("INCLUDE TYPE via GROUPNAME", () => {
    const tabl1 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTABL1</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <LANGDEP>X</LANGDEP>
    <DDTEXT>test</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>.INCLUDE</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <PRECFIELD>ZTABL2</PRECFIELD>
     <MASK>      S</MASK>
     <DDTEXT>test</DDTEXT>
     <COMPTYPE>S</COMPTYPE>
     <GROUPNAME>GROUP_NAME</GROUPNAME>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD1</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>g</INTTYPE>
     <INTLEN>000008</INTLEN>
     <DATATYPE>STRG</DATATYPE>
     <MASK>  STRG</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const tabl2 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTABL2</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>test</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>FIELD2</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>g</INTTYPE>
     <INTLEN>000008</INTLEN>
     <DATATYPE>STRG</DATATYPE>
     <MASK>  STRG</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const code = `
INTERFACE zintf PUBLIC.
  TYPES: BEGIN OF ty_foo,
    moo TYPE string.
    INCLUDE TYPE ztabl1-group_name AS blah.
  TYPES END OF ty_foo.
ENDINTERFACE.`;

    const issues = runMulti([
      {filename: "ztabl1.tabl.xml", contents: tabl1},
      {filename: "ztabl2.tabl.xml", contents: tabl2},
      {filename: "zintf.intf.abap", contents: code}]);
    expect(issues.length).to.equals(0);
  });

  it("LIKE RANGE OF local var", () => {
    const abap = `
    DATA report TYPE c LENGTH 1.
    DATA ltr_report LIKE RANGE OF report.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("interface constant referenced via class", () => {
    const abap = `
  INTERFACE lif.
    CONSTANTS const TYPE i VALUE 2.
  ENDINTERFACE.

  CLASS lcl DEFINITION.
    PUBLIC SECTION.
      INTERFACES lif.
  ENDCLASS.
  CLASS lcl IMPLEMENTATION.
  ENDCLASS.

  WRITE lcl=>lif~const.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("SELECT SINGLE, inner join", () => {
    const tabl3 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTABL3</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>test</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZTABL3</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>MANDT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>KEYFIELD3</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000020</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>VALUEFIELD3</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000020</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const tabl4 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTABL4</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>test</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZTABL4</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>MANDT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>KEYFIELD4</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000020</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>VALUEFIELD4</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000020</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const code = `
DATA lv_val TYPE string.
SELECT SINGLE ztabl3~valuefield3 INTO lv_val
  FROM ztabl3
  INNER JOIN ztabl4 ON ztabl3~keyfield3 = ztabl4~keyfield4
  WHERE ztabl4~valuefield4 = 'ABC'.`;

    const issues = runMulti([
      {filename: "ztabl3.tabl.xml", contents: tabl3},
      {filename: "ztabl4.tabl.xml", contents: tabl4},
      {filename: "zinner.prog.abap", contents: code}]);
    expect(issues.length).to.equals(0);
  });

  it("ASSING CASTING TYPE C", () => {
    const abap = `
    FIELD-SYMBOLS <dest> TYPE any.
    DATA bah TYPE c LENGTH 10.
    ASSIGN bah TO <dest> CASTING TYPE c.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("Aliased attribute from super class", () => {
    const abap = `
INTERFACE lif.
  DATA go_dyn TYPE string.
ENDINTERFACE.

CLASS sup DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
    ALIASES go_dyn FOR lif~go_dyn.
ENDCLASS.
CLASS sup IMPLEMENTATION.
ENDCLASS.

CLASS child DEFINITION INHERITING FROM sup.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS child IMPLEMENTATION.
  METHOD bar.
    WRITE go_dyn.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("long CALL METHOD", () => {
    const abap = `
INTERFACE lifserver.
  METHODS encode.
ENDINTERFACE.

INTERFACE lif.
  DATA go_server TYPE REF TO lifserver.
ENDINTERFACE.

CLASS env DEFINITION.
  PUBLIC SECTION.
    CLASS-DATA instance TYPE REF TO lif.
ENDCLASS.
CLASS env IMPLEMENTATION.
ENDCLASS.

CALL METHOD env=>instance->go_server->encode.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("voided method call, ok", () => {
    const abap = `CALL METHOD cl_abap_elemdescr=>('GET_INT8').`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("incompatible type, tab supplied to string parameter", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS method1 IMPORTING str TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD method1.
    DATA tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    method1( tab ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("type checking void and header lines", () => {
    const abap = `
TYPES: BEGIN OF type,
         language TYPE string,
       END OF type.
DATA it_language TYPE STANDARD TABLE OF type WITH HEADER LINE.
DATA it_t002t TYPE STANDARD TABLE OF t002t WITH HEADER LINE.
it_language-language = it_t002t-sptxt.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("type checking, WRITE internal table should give error", () => {
    const abap = `
DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
WRITE tab.`;
    const issues = runProgram(abap);
    expect(issues[0].getMessage()).to.contain("not character like");
  });

  it("type checking, WRITE integer, ok", () => {
    const abap = `
    DATA int TYPE i.
    WRITE int.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("type checking, WRITE xstring, ok", () => {
    const abap = `
    DATA lv_xstring TYPE xstring.
    WRITE lv_xstring.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("type checking, WRITE hex, ok", () => {
    const abap = `
    DATA lv_hex TYPE x LENGTH 6.
    WRITE lv_hex.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("type checking, WRITE float, ok", () => {
    const abap = `
    DATA float TYPE f.
    float = 12345.
    WRITE float.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("WRITE numeric, ok", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS bar IMPORTING num TYPE numeric.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD bar.
    WRITE num.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("attribute from interface, ok", () => {
    const abap = `
INTERFACE intf.
  DATA foo TYPE i.
ENDINTERFACE.

CLASS bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS moo RETURNING VALUE(asdf) TYPE REF TO intf.
ENDCLASS.
CLASS bar IMPLEMENTATION.
  METHOD moo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  WRITE / bar=>moo( )->foo.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("write, table with header line, ok", () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF string WITH HEADER LINE.
    WRITE tab.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("type error when calling lines()", () => {
    const abap = `
    DATA int TYPE i.
    WRITE lines( int ).`;
    const issues = runProgram(abap);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("Error, using variable defined in LET outside expression", () => {
    const abap = `
  TYPES ty_tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA(result) = VALUE ty_tab(
    ( COND string( LET current_count = 2 IN
      WHEN current_count = 1 THEN |{ current_count }|
      ELSE |{ current_count }| )
    ) ).
  WRITE current_count.`;
    const issues = runProgram(abap);
    expect(issues[0].getMessage()).to.contain(`"current_count" not found`);
  });

  it("Error, using already declared", () => {
    const abap = `
  DATA current_count TYPE i.
  TYPES ty_tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA(result) = VALUE ty_tab(
    ( COND string( LET current_count = 2 IN
      WHEN current_count = 1 THEN |{ current_count }|
      ELSE |{ current_count }| )
    ) ).
    `;
    const issues = runProgram(abap);
    expect(issues[0].getMessage()).to.contain("current_count already defined");
  });

  it("Error, variable not found", () => {
    const abap = `
  DATA(result) = VALUE string_table( FOR i = 0 UNTIL i = 42 ( || ) ).
  WRITE i.`;
    const issues = runProgram(abap);
    expect(issues[0].getMessage()).to.contain(`"i" not found`);
  });

  it("ok, strlen typing with voided header line table", () => {
    const abap = `
    DATA p_new_where LIKE TABLE OF voided WITH HEADER LINE.
    WRITE strlen( p_new_where ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, strlen typing with string header line table", () => {
    const abap = `
    DATA p_new_where TYPE TABLE OF string WITH HEADER LINE.
    WRITE strlen( p_new_where ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, strlen typing with string header line table", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS call IMPORTING foo TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD call.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA p_new_where TYPE voided WITH HEADER LINE.
  lcl=>call( p_new_where ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("Error, variable not compatible", () => {
    const abap = `
  CLASS lcl1 DEFINITION.
  ENDCLASS.

  CLASS lcl1 IMPLEMENTATION.
  ENDCLASS.

  CLASS lcl2 DEFINITION.
    PUBLIC SECTION.
      CLASS-METHODS method1 IMPORTING ref2 TYPE REF TO lcl2.
  ENDCLASS.

  CLASS lcl2 IMPLEMENTATION.
    METHOD method1.
    ENDMETHOD.
  ENDCLASS.

  START-OF-SELECTION.
    DATA ref1 TYPE REF TO lcl1.
    lcl2=>method1( ref1 ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`not compatible`);
  });

  it("inheritance, types ok", () => {
    const abap = `
  CLASS lcl1 DEFINITION.
  ENDCLASS.

  CLASS lcl1 IMPLEMENTATION.
  ENDCLASS.

  CLASS lcl2 DEFINITION INHERITING FROM lcl1.
    PUBLIC SECTION.
      CLASS-METHODS method1 IMPORTING ref2 TYPE REF TO lcl1.
  ENDCLASS.

  CLASS lcl2 IMPLEMENTATION.
    METHOD method1.
    ENDMETHOD.
  ENDCLASS.

  START-OF-SELECTION.
    DATA ref2 TYPE REF TO lcl2.
    lcl2=>method1( ref2 ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("implements interface, types ok", () => {
    const abap = `
  INTERFACE lif1.
  ENDINTERFACE.

  CLASS lcl2 DEFINITION.
    PUBLIC SECTION.
      INTERFACES lif1.
      CLASS-METHODS method1 IMPORTING ref2 TYPE REF TO lif1.
  ENDCLASS.

  CLASS lcl2 IMPLEMENTATION.
    METHOD method1.
    ENDMETHOD.
  ENDCLASS.

  START-OF-SELECTION.
    DATA ref2 TYPE REF TO lcl2.
    lcl2=>method1( ref2 ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("returning class implemementing intf, types ok", () => {
    const abap = `
  INTERFACE lif1.
  ENDINTERFACE.

  CLASS lcl2 DEFINITION.
    PUBLIC SECTION.
      INTERFACES lif1.
      CLASS-METHODS method1 RETURNING VALUE(ref) TYPE REF TO lcl2.
  ENDCLASS.

  CLASS lcl2 IMPLEMENTATION.
    METHOD method1.
    ENDMETHOD.
  ENDCLASS.

  START-OF-SELECTION.
    DATA ref2 TYPE REF TO lif1.
    ref2 = lcl2=>method1( ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("move, types ok", () => {
    const abap = `
  CLASS cxx_root DEFINITION.
  ENDCLASS.

  CLASS cxx_root IMPLEMENTATION.
  ENDCLASS.

  START-OF-SELECTION.
    DATA previous_exception TYPE REF TO cxx_root.
    DATA exception TYPE REF TO cxx_root.
    previous_exception = exception.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("move, types ok, 2", () => {
    const abap = `
CLASS logger DEFINITION.
  PUBLIC SECTION.
    METHODS drill_down_into_exception
      IMPORTING
        exception TYPE REF TO cx_root.
ENDCLASS.

CLASS logger IMPLEMENTATION.
  METHOD drill_down_into_exception.
    DATA previous_exception TYPE REF TO cx_root.
    previous_exception = exception.
  ENDMETHOD.
ENDCLASS.`;

    const root = `CLASS cx_root DEFINITION ABSTRACT PUBLIC.
ENDCLASS.
CLASS cx_root IMPLEMENTATION.
ENDCLASS.`;

    const issues = runMulti([
      {filename: "logger.clas.abap", contents: abap},
      {filename: "cx_root.clas.abap", contents: root}]);
    expect(issues.length).to.equals(0);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("move, void to other void, types ok", () => {
    const abap = `
    DATA v1 TYPE REF TO void1.
    DATA v2 TYPE REF TO void2.
    v1 = v2.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("cast, types ok", () => {
    const abap = `
  CLASS lcl1 DEFINITION.
  ENDCLASS.
  CLASS lcl1 IMPLEMENTATION.
  ENDCLASS.

  CLASS lcl2 DEFINITION INHERITING FROM lcl1.
  ENDCLASS.
  CLASS lcl2 IMPLEMENTATION.
  ENDCLASS.

  START-OF-SELECTION.
    DATA ref1 TYPE REF TO lcl1.
    DATA ref2 TYPE REF TO lcl2.
    ref2 ?= ref1.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("READ TABLE, types ok, no error", () => {
    const abap = `
INTERFACE lif_sxml_attribute.
  TYPES attributes TYPE STANDARD TABLE OF REF TO lif_sxml_attribute WITH DEFAULT KEY.
ENDINTERFACE.

START-OF-SELECTION.
  DATA lt_attributes TYPE lif_sxml_attribute=>attributes.
  DATA li_attribute TYPE REF TO lif_sxml_attribute.
  READ TABLE lt_attributes INDEX 1 INTO li_attribute.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("move, inherit, types ok", () => {
    const abap = `
CLASS logger DEFINITION.
  PUBLIC SECTION.
    METHODS drill_down_into_exception
      IMPORTING
        exception TYPE REF TO cx_root.
ENDCLASS.

CLASS logger IMPLEMENTATION.
  METHOD drill_down_into_exception.
    DATA dyn TYPE REF TO cx_sy_dyn_call_error.
    drill_down_into_exception( exception = dyn ).
  ENDMETHOD.
ENDCLASS.`;

    const root = `CLASS cx_root DEFINITION ABSTRACT PUBLIC.
ENDCLASS.
CLASS cx_root IMPLEMENTATION.
ENDCLASS.`;

    const dynamic = `CLASS cx_dynamic_check DEFINITION PUBLIC INHERITING FROM cx_root.
ENDCLASS.
CLASS cx_dynamic_check IMPLEMENTATION.
ENDCLASS.`;

    const dyn_call = `CLASS cx_sy_dyn_call_error DEFINITION PUBLIC INHERITING FROM cx_dynamic_check.
ENDCLASS.
CLASS cx_sy_dyn_call_error IMPLEMENTATION.
ENDCLASS.`;

    const issues = runMulti([
      {filename: "logger.clas.abap", contents: abap},
      {filename: "cx_root.clas.abap", contents: root},
      {filename: "cx_dynamic_check.clas.abap", contents: dynamic},
      {filename: "cx_sy_dyn_call_error.clas.abap", contents: dyn_call},
    ]);
    expect(issues.length).to.equals(0);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("NEW, infer type, ok", () => {
    const abap = `
  CLASS lcl_reader DEFINITION.
  ENDCLASS.
  CLASS lcl_reader IMPLEMENTATION.
  ENDCLASS.
  START-OF-SELECTION.
    DATA lo_reader TYPE REF TO lcl_reader.
    lo_reader = NEW #( ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("deferred, ok", () => {
    const abap = `
INTERFACE zif_abapgit_log DEFERRED.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING ii_log TYPE REF TO zif_abapgit_log OPTIONAL.
    DATA mi_log TYPE REF TO zif_abapgit_log READ-ONLY.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD constructor.
    me->mi_log = ii_log.
  ENDMETHOD.
ENDCLASS.

INTERFACE zif_abapgit_log.
ENDINTERFACE.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CALL METHOD with basic reference, method not found, expect error", () => {
    const abap = `
CLASS logger DEFINITION.
  PUBLIC SECTION.
    METHODS drill_down_into_exception
      IMPORTING
        exception TYPE REF TO cx_root.
ENDCLASS.

CLASS logger IMPLEMENTATION.
  METHOD drill_down_into_exception.
    CALL METHOD exception->sdfsdfsdfs.
  ENDMETHOD.
ENDCLASS.`;

    const root = `CLASS cx_root DEFINITION ABSTRACT PUBLIC.
ENDCLASS.
CLASS cx_root IMPLEMENTATION.
ENDCLASS.`;

    const issues = runMulti([
      {filename: "logger.clas.abap", contents: abap},
      {filename: "cx_root.clas.abap", contents: root},
    ]);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.include("not found");
    expect(issues[0].getMessage()).to.include("sdfsdfsdfs");
  });

  it("FOR ALL ENTRIES IN []", () => {
    const abap = `
    DATA lt_ltext TYPE STANDARD TABLE OF testtest.
    DATA gt_box1 TYPE STANDARD TABLE OF testtest.
    SELECT spras FROM testtest INTO TABLE lt_ltext
          FOR ALL ENTRIES IN gt_box1[]
          WHERE spras = sy-langu
          AND   field = gt_box1-field.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("Infer switch type to string", () => {
    const abap = `
  DATA asset_type TYPE string.
  DATA(result) = SWITCH #(
    asset_type
    WHEN 'CSS' THEN |sdf|
    WHEN 'HTML' THEN |sdf|
    ELSE |sdf| ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("WRITE col_group.", () => {
    const abap = `WRITE col_group.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("MATCH OFFSET inline", () => {
    const abap = `DATA lv_uri TYPE string.
  FIND FIRST OCCURRENCE OF '/' IN SECTION OFFSET 7 OF lv_uri IGNORING CASE MATCH OFFSET DATA(lv_end_site_offset).
  WRITE lv_end_site_offset.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CALL METHOD, error expected, parameter not found", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS get_token
      IMPORTING
        iv_username TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get_token.
    CALL METHOD lcl=>get_token
      EXPORTING
        not_valid = 'abc'.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`NOT_VALID`);
  });

  it("duplicate in CATCH", () => {
    const abap = `
  TRY.
    CATCH cx_root cx_root.
  ENDTRY.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`Duplicate`);
  });

  it("Error, split table target must be character like", () => {
    const abap = `
    DATA str TYPE string.
    DATA int_tab TYPE TABLE OF i.
    str = '1 2 10'.
    SPLIT str AT space INTO TABLE int_tab.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`Incompatible`);
  });

  it("split, ok, voided", () => {
    const abap = `
    DATA str TYPE string.
    DATA int_tab TYPE voided.
    str = '1 2 10'.
    SPLIT str AT space INTO TABLE int_tab.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("double FOR loop, ok", () => {
    const abap = `
  TYPES type TYPE STANDARD TABLE OF string WITH EMPTY KEY.
  DATA tab TYPE type.
  DATA(result) = VALUE type( FOR part IN tab FOR line IN tab ( line ) ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, field name = OCCURS", () => {
    const abap = `
TYPES: BEGIN OF ty_letter,
         letter(1) TYPE c,
         occurs    TYPE i,
       END OF ty_letter.
DATA letter TYPE ty_letter.
letter-occurs = 1.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("GROUP BY, inline data", () => {
    const abap = `
DATA lt_eina TYPE STANDARD TABLE OF eina WITH DEFAULT KEY.
LOOP AT lt_eina INTO DATA(ls_eina_local)
    GROUP BY ( matnr = ls_eina_local-matnr )
    INTO DATA(ls_eina_group).
  WRITE ls_eina_group-matnr.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP AT GROUP", () => {
    const abap = `
DATA lt_eina TYPE STANDARD TABLE OF eina WITH DEFAULT KEY.
LOOP AT lt_eina INTO DATA(ls_eina_local)
    GROUP BY ( matnr = ls_eina_local-matnr )
    INTO DATA(ls_eina_group).
  WRITE ls_eina_group-matnr.
  LOOP AT GROUP ls_eina_group INTO DATA(ls_eina).
    WRITE ls_eina-infnr.
  ENDLOOP.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("REDUCE with LET used in FOR", () => {
    const abap = `
    DATA(text) = REDUCE string(
      LET txt_len = strlen( |dfsdfs| ) IN
      INIT foo = ||
      FOR i = 1 UNTIL i > txt_len
      NEXT foo = foo && |sdf| ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("numeric field name, ok", () => {
    const abap = `
TYPES: BEGIN OF ret__test,
         200 TYPE string,
       END OF ret__test.
DATA ret TYPE ret__test.
WRITE ret-200.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CHANGING type simple vs structure", () => {
    const abap = `
CLASS lcl_test DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS test
      CHANGING
        cg_data TYPE simple.
ENDCLASS.
CLASS lcl_test IMPLEMENTATION.
  METHOD test.
    RETURN.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA:
    BEGIN OF gs_data,
      key TYPE c LENGTH 1,
      val TYPE c LENGTH 10,
    END OF gs_data.
  lcl_test=>test( CHANGING cg_data = gs_data ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it.skip("Error, insert, types incompatible", () => {
    const abap = `
  DATA str TYPE string.
  DATA int_tab TYPE TABLE OF i.
  str = '20'.
  INSERT str INTO TABLE int_tab.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`Incompatible`);
  });

  it("MOVE-CORRESPONDING with internal tables not possible on 702", () => {
    const abap = `
DATA tab1 TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
DATA tab2 TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
MOVE-CORRESPONDING tab1 TO tab2.`;
    const issues = runProgram(abap, [], Version.v702);
    expect(issues[0]?.getMessage()).to.include("MOVE-CORRESPONDING with tables possible");
  });

  it("field symbol tokens is undefined", () => {
    const abap = `
DATA chain_tokens TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
DATA sfrom TYPE i.
APPEND LINES OF <tokens> FROM sfrom TO chain_tokens.`;
    const issues = runProgram(abap, [], Version.v702);
    expect(issues[0]?.getMessage()).to.include("tokens");
  });

  it("too few spaces, ok", () => {
    const abap = `
DATA lo_dest TYPE REF TO voided.
lo_dest->set('HELLO').`;
    const issues = runProgram(abap, [], Version.v702);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("error, field chain ends with dash", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS deserialize IMPORTING foo TYPE string.
    CONSTANTS: BEGIN OF mode,
                 bar TYPE string VALUE 'sdf',
               END OF mode.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD deserialize.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  lcl=>deserialize( lcl=>mode- ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.include("with dash");
  });

  it("error, field not part of structure", () => {
    const abap = `
    TYPES foo TYPE RANGE OF i.
    DATA(sdf) = VALUE foo( ( foobar = 2 ) ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.include("field foobar does not exist");
  });

  it("SORT, verify fields exists", () => {
    const abap = `
  TYPES: BEGIN OF initial_type,
             group       TYPE group,
             number      TYPE i,
             description TYPE string,
         END OF initial_type,
         itab_data_type TYPE STANDARD TABLE OF initial_type WITH  EMPTY KEY.
  DATA itab TYPE itab_data_type.
  SORT itab BY group asc number desc.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.include("Field ASC does not exist");
  });

  it("SORT, table with voided row, ok", () => {
    const abap = `
    DATA lt_dd07v TYPE TABLE OF dd07v.
    SORT lt_dd07v BY
    valpos ASCENDING
    ddlanguage ASCENDING.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("Double FOR loop with INDEX", () => {
    const abap = `
TYPES: BEGIN OF combined_data_type,
         colx TYPE string,
       END OF combined_data_type.
TYPES combined_data TYPE STANDARD TABLE OF combined_data_type WITH EMPTY KEY.
DATA alphas TYPE combined_data.
DATA(combined_data) = VALUE combined_data(
  FOR ls_alpha IN alphas INDEX INTO lv_index
  FOR ls_num IN alphas FROM lv_index TO lv_index
  LET ls_comb = VALUE combined_data_type( colx = |hello| )
  IN ( ls_comb ) ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP GROUP BY INTO DATA", () => {
    const abap = `
TYPES: BEGIN OF initial_numbers_type,
         group  TYPE group,
         number TYPE i,
       END OF initial_numbers_type.
DATA initial_numbers TYPE STANDARD TABLE OF initial_numbers_type WITH DEFAULT KEY.
APPEND INITIAL LINE TO initial_numbers.
LOOP AT initial_numbers INTO DATA(number)
                        GROUP BY number-group
                        INTO DATA(groups).
  LOOP AT GROUP groups INTO DATA(group).
    WRITE / group-group.
  ENDLOOP.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP GROUP BY ASSIGNING fs", () => {
    const abap = `
TYPES: BEGIN OF initial_numbers_type,
         group  TYPE group,
         number TYPE i,
       END OF initial_numbers_type.
DATA initial_numbers TYPE STANDARD TABLE OF initial_numbers_type WITH DEFAULT KEY.
APPEND INITIAL LINE TO initial_numbers.
LOOP AT initial_numbers ASSIGNING FIELD-SYMBOL(<number>)
                        GROUP BY <number>-group
                        ASSIGNING FIELD-SYMBOL(<groups>).
  LOOP AT GROUP <groups> ASSIGNING FIELD-SYMBOL(<group>).
    WRITE / <group>-group.
  ENDLOOP.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("INSERT REFERENCE INTO inline definition", () => {
    const abap = `
TYPES: BEGIN OF aggregated_data_type,
         count TYPE i,
       END OF aggregated_data_type.
DATA aggregated_data TYPE STANDARD TABLE OF aggregated_data_type WITH DEFAULT KEY.
DATA row LIKE LINE OF aggregated_data.
INSERT row INTO TABLE aggregated_data REFERENCE INTO DATA(aggregated_data_row).
CLEAR aggregated_data_row.
WRITE aggregated_data_row->count.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("REDUCE FOR GROUPS", () => {
    const abap = `
TYPES: BEGIN OF aggregated_data_type,
         group TYPE i,
       END OF aggregated_data_type.
TYPES aggregated_data TYPE STANDARD TABLE OF aggregated_data_type WITH DEFAULT KEY.
DATA aggregated_data TYPE aggregated_data.
DATA initial_numbers TYPE aggregated_data.
aggregated_data = REDUCE aggregated_data(
  INIT aggregated = VALUE aggregated_data( )
       data = VALUE aggregated_data_type( )
  FOR GROUPS group_key OF wa IN initial_numbers
    GROUP BY wa-group ASCENDING
  NEXT data = VALUE #( group = group_key )
       aggregated = VALUE #( BASE aggregated ( data ) ) ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("DESCRIBE, COMPONENTS inline", () => {
    const abap = `
DATA lv_foo TYPE c LENGTH 1.
DESCRIBE FIELD lv_foo TYPE DATA(lv_type) COMPONENTS DATA(lv_components).
WRITE lv_type.
WRITE lv_components.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("REDUCE identical names, ok", () => {
    const abap = `
DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
APPEND 2 TO tab.
WRITE / REDUCE i( INIT s = 0 FOR g IN tab NEXT s = s + g ).
WRITE / REDUCE i( INIT s = 0 FOR g IN tab NEXT s = s + g ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("inline, IN GROUP", () => {
    const abap = `
TYPES: BEGIN OF ty,
         group TYPE i,
       END OF ty.
DATA initial_numbers TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
LOOP AT initial_numbers INTO DATA(g) GROUP BY g-group .
  DATA(group_count) = REDUCE #( INIT i = 0 FOR c IN GROUP g NEXT i = i + 1 ).
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("GET REFERENCE OF fs INTO inline", () => {
    const abap = `
DATA nested_data TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
ASSIGN nested_data[ 1 ] TO FIELD-SYMBOL(<temp1>).
GET REFERENCE OF <temp1> INTO DATA(nested_artist).
CLEAR nested_artist.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FOR GROUPS + IN GROUP", () => {
    const abap = `
TYPES: BEGIN OF ty,
         group TYPE i,
         count TYPE i,
       END OF ty.
DATA initial_numbers TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
DATA aggregated_data TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.

aggregated_data = VALUE #(
  FOR GROUPS grp OF rec IN initial_numbers
  GROUP BY ( group = rec-group cnt = GROUP SIZE )
  LET res = REDUCE ty(
    INIT tmp = VALUE ty( )
    FOR rec2 IN GROUP grp
    NEXT tmp = VALUE #( ) ) IN
  ( group = 2
  count = 2 ) ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("RENAMING WITH SUFFIX", () => {
    const abap = `
TYPES: BEGIN OF ty,
         field1 TYPE c LENGTH 2,
       END OF ty.

TYPES BEGIN OF cul.
INCLUDE TYPE ty AS foo1 RENAMING WITH SUFFIX _s1.
INCLUDE TYPE ty AS foo2 RENAMING WITH SUFFIX _s2.
TYPES END OF cul.

DATA foo TYPE cul.

WRITE foo-field1_s1.
WRITE foo-foo1-field1.
WRITE foo-field1_s2.
WRITE foo-foo2-field1.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CALLed METHOD not existing, expect error", () => {
    const abap = `
INTERFACE lif.
  METHODS foo.
ENDINTERFACE.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD lif~foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA lo TYPE REF TO lif.
  CREATE OBJECT lo TYPE lcl.
  CALL METHOD lo->not_exists.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.not.equal(undefined);
    expect(issues[0]?.getMessage().toUpperCase()).to.include("NOT_EXISTS");
  });

  it("Short LOOP syntax, no header, issue error", () => {
    const abap = `
DATA users TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
LOOP AT users.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.not.equal(undefined);
    expect(issues[0]?.getMessage()).to.include("no header line");
  });

  it("Short LOOP syntax, ok", () => {
    const abap = `
DATA users TYPE i OCCURS 0 WITH HEADER LINE.
LOOP AT users.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("something with something tables references and stuff", () => {
// note: "APPEND binding" appends to the header, and the reference of the new row is INTO
    const abap = `
DATA binding TYPE i OCCURS 0 WITH HEADER LINE.
TYPES: BEGIN OF ty_attr,
         binding LIKE REF TO binding,
       END OF   ty_attr.
TYPES ty_t_attr TYPE STANDARD TABLE OF ty_attr WITH DEFAULT KEY.
DATA it_attr TYPE ty_t_attr.
DATA wa LIKE LINE OF it_attr.
APPEND binding REFERENCE INTO wa-binding.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("READ Entities, inline definitions", () => {
    const abap = `
    DATA keys TYPE voided.

    READ ENTITIES OF /foo/bar IN LOCAL MODE
      ENTITY ent
      FIELDS ( fieldname )
      WITH CORRESPONDING #( keys )
      RESULT DATA(lt_dat)
      FAILED DATA(lt_failed).

    CHECK lt_failed IS INITIAL.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP at deference ref to data", () => {
// note: this doesnt work in low versions, must be 754+
    const abap = `
    TYPES: BEGIN OF ty_foo,
             data  TYPE REF TO data,
           END OF ty_foo.
    TYPES ty_foo_tt TYPE STANDARD TABLE OF ty_foo WITH EMPTY KEY.
    DATA lt_result TYPE ty_foo_tt.
    LOOP AT lt_result ASSIGNING FIELD-SYMBOL(<fs1>).
      LOOP AT <fs1>-data->* ASSIGNING FIELD-SYMBOL(<fs2>).
      ENDLOOP.
    ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("super call without super class", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS constructor.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD constructor.
    super->constructor( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("MODIFY internal table", () => {
    const abap = `
DATA ztab TYPE STANDARD TABLE OF i.
DATA row LIKE LINE OF ztab.
MODIFY ztab FROM row.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FILTER, infer", () => {
    const abap = `
TYPES: BEGIN OF ty,
         field1 TYPE i,
       END OF ty.
DATA lt_tab TYPE SORTED TABLE OF ty WITH UNIQUE KEY field1.
LOOP AT FILTER #( lt_tab WHERE field1 = 2 ) INTO DATA(ls_row).
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("clear voided data reference", () => {
    const abap = `
DATA r TYPE REF TO t100.
CLEAR r->*.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("loop USING KEY primary_key", () => {
    const abap = `
DATA tab TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line.
LOOP AT tab INTO DATA(row) USING KEY primary_key.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("classic delete FROM database table", () => {
    const abap = `
DATA row TYPE zrst.
DELETE zrst FROM row.`;
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZRST</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>sdf</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZRST</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>MANDT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>FOO</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>CHAR1</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>BAR</FIELDNAME>
     <ROLLNAME>CHAR1</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = runMulti([
      {filename: "zrst.tabl.xml", contents: xml},
      {filename: "zdelete.prog.abap", contents: abap}]);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it.skip("accessing me is not possible in static methods", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar.
    CLASS-DATA foo TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD bar.
    me->foo = 2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("me");
  });

  it("ok", () => {
    const abap = `
CLASS abstractfile DEFINITION.
ENDCLASS.
CLASS abstractfile IMPLEMENTATION.
ENDCLASS.
CLASS memoryfile DEFINITION INHERITING FROM abstractfile.
ENDCLASS.
CLASS memoryfile IMPLEMENTATION.
ENDCLASS.

START-OF-SELECTION.
  NEW memoryfile( ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it(".INCLU void type in TABL", () => {
    const abap = `
REPORT zfoo.

DATA foo TYPE zfoozz.
CLEAR foo-lowzz.`;
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZFOOZZ</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <LANGDEP>X</LANGDEP>
    <DDTEXT>sdf</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>FIELD1</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>g</INTTYPE>
     <INTLEN>000008</INTLEN>
     <DATATYPE>STRG</DATATYPE>
     <MASK>  STRG</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>.INCLU-ZZ</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <PRECFIELD>RSDSSELOPT</PRECFIELD>
     <MASK>      S</MASK>
     <DDTEXT>Structure of generic SELECT-OPTION for (dynamic selections)</DDTEXT>
     <COMPTYPE>S</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = runMulti([
      {filename: "zfoozz.tabl.xml", contents: xml},
      {filename: "zfoo.prog.abap", contents: abap}]);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("offset with class constant", () => {
    const abap = `
CLASS lcl_constant DEFINITION.
  PUBLIC SECTION.
    CONSTANTS c_header_length TYPE i VALUE 28.
ENDCLASS.

DATA:
  lv_telegram TYPE string VALUE 'ABCDEFGHIJ',
  lv_telegram2 TYPE string.

MOVE lv_telegram+0(lcl_constant=>c_header_length) TO lv_telegram2.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP into data reference into", () => {
    const abap = `
TYPES: BEGIN OF ty_pil,
         pid  TYPE i,
         lbay TYPE i,
       END OF ty_pil.
DATA lt_pil TYPE TABLE OF ty_pil.
LOOP AT lt_pil INTO DATA(ls_pil) GROUP BY ( pid = ls_pil-pid ) ASCENDING REFERENCE INTO DATA(ls_pil2_ref).
  WRITE 'Hello World'.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("GET bit inline", () => {
    const abap = `
DATA lv_source_hex TYPE xstring.
DATA lv_source TYPE char16.
GET BIT sy-index OF lv_source_hex INTO DATA(lv_res).
lv_source = lv_source && lv_res.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("PREFERRED PARAMETER is optional", () => {
    const abap = `
CLASS lcl_tele_mapping DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS replaceit
      IMPORTING
        iv_new    TYPE i OPTIONAL
        iv_string TYPE string
          PREFERRED PARAMETER iv_string.
ENDCLASS.

CLASS lcl_tele_mapping IMPLEMENTATION.
  METHOD replaceit.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  lcl_tele_mapping=>replaceit( iv_new = 2 ).
  lcl_tele_mapping=>replaceit( 'A' ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CALL METHOD, foobar voided, ok", () => {
    const abap = `
INTERFACE if_srv.
  METHODS update_batch.
  METHODS update_line.
ENDINTERFACE.

CLASS cl_srv_batch DEFINITION.
  PUBLIC SECTION.
    INTERFACES if_srv.
    ALIASES update_batch FOR if_srv~update_batch.
    ALIASES update_line FOR if_srv~update_line.

  PROTECTED SECTION.
    DATA foobar TYPE REF TO voided.
ENDCLASS.

CLASS cl_srv_batch IMPLEMENTATION.
  METHOD update_batch.
  ENDMETHOD.

  METHOD update_line.
    CALL METHOD me->foobar->update_batch
      EXPORTING
        iv_docid = 2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CALL METHOD, simple, ok", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    CALL METHOD foo.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("object is a predefined type, CAST", () => {
    const abap = `
DATA io_app TYPE REF TO object.
io_app = CAST object( io_app ).`;
    const issues = runProgram(abap, [], undefined, ".");
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("VALUE LET tab", () => {
    const abap = `
TYPES: BEGIN OF ty_row,
         name TYPE string,
       END OF ty_row.
TYPES ty_tab TYPE STANDARD TABLE OF ty_row WITH EMPTY KEY.
DATA val TYPE ty_tab.
DATA(sdf) = VALUE ty_tab(
  LET tab = val IN
  FOR row IN tab
  ( name = to_upper( row-name ) ) ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("parameter name too long", () => {
    const abap = `
PARAMETERS p_helloworld TYPE i.`;
    const issues = runProgram(abap);
    const message = issues[0]?.getMessage();
    expect(message).to.not.equal(undefined);
    expect(message).to.contain("p_helloworld");
  });

  it("casting data references", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty,
             field TYPE string,
           END OF ty.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

START-OF-SELECTION.
  TYPES foo TYPE REF TO lcl=>ty.
  DATA lr_data TYPE REF TO foo.
  DATA(lr_cont) = CAST lcl=>ty( lr_data->* ).
  WRITE lr_cont->field.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP, ok", () => {
    const abap = `
TYPES: BEGIN OF ty,
         obj_type TYPE string,
       END OF ty.
DATA lt_objects TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
DATA lr_object TYPE REF TO ty.
LOOP AT lt_objects REFERENCE INTO lr_object WHERE obj_type IS INITIAL.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, standard with secondary unique keys", () => {
    const abap = `
TYPES: BEGIN OF ty_overwrite,
         obj_type TYPE string,
         obj_name TYPE string,
       END OF ty_overwrite.
TYPES ty_overwrite_tt TYPE STANDARD TABLE OF ty_overwrite WITH DEFAULT KEY
  WITH UNIQUE HASHED KEY object_type_and_name COMPONENTS obj_type obj_name.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, standard with secondary unique keys", () => {
    const abap = `
  TYPES:
    BEGIN OF ty_mapping_field,
      abap TYPE string,
      json TYPE string,
    END OF ty_mapping_field,
    ty_mapping_fields TYPE STANDARD TABLE OF ty_mapping_field
      WITH UNIQUE SORTED KEY abap COMPONENTS abap
      WITH UNIQUE SORTED KEY json COMPONENTS json.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("Check fields in LOOP condition", () => {
    const abap = `
TYPES: BEGIN OF ty,
         foo TYPE string,
       END OF ty.
DATA tab TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
LOOP AT tab INTO DATA(sdfsd) WHERE blah = 'SYS'.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("blah");
  });

  it("Error, standard with unique key", () => {
    const abap = `
TYPES: BEGIN OF ty_row,
         i TYPE i,
         s TYPE string,
       END OF ty_row.
DATA itab TYPE STANDARD TABLE OF ty_row WITH UNIQUE KEY i.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("STANDARD tables cannot have UNIQUE key");
  });

  it("Error, field does not exist", () => {
    const abap = `
INTERFACE lif.
  DATA foo TYPE string.
ENDINTERFACE.

START-OF-SELECTION.
  DATA tab TYPE STANDARD TABLE OF REF TO lif WITH DEFAULT KEY.
  READ TABLE tab WITH KEY table_line->wrong = 'bar' TRANSPORTING NO FIELDS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("wrong");
  });

  it("ok, read table data reference", () => {
    const abap = `
TYPES: BEGIN OF foo,
         field TYPE i,
       END OF foo.
DATA tab TYPE STANDARD TABLE OF REF TO foo WITH DEFAULT KEY.
READ TABLE tab WITH KEY table_line->field = 2 TRANSPORTING NO FIELDS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, read table data reference, dereference", () => {
    const abap = `
DATA tab TYPE STANDARD TABLE OF REF TO i WITH DEFAULT KEY.
READ TABLE tab WITH KEY table_line->* = 2 TRANSPORTING NO FIELDS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, read table via alias field", () => {
    const abap = `
INTERFACE top.
  DATA bar TYPE string.
ENDINTERFACE.

INTERFACE lif.
  INTERFACES top.
  ALIASES name FOR top~bar.
ENDINTERFACE.

DATA tab TYPE STANDARD TABLE OF REF TO lif WITH DEFAULT KEY.

READ TABLE tab WITH KEY table_line->name = 'sdf' TRANSPORTING NO FIELDS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, delete internal", () => {
    const abap = `
INTERFACE lif.
  DATA data TYPE string.
ENDINTERFACE.
DATA tab TYPE STANDARD TABLE OF REF TO lif WITH EMPTY KEY.
DELETE tab WHERE table_line->data <> 'true'.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("error, delete internal", () => {
    const abap = `
INTERFACE lif.
  DATA data TYPE string.
ENDINTERFACE.
DATA tab TYPE STANDARD TABLE OF REF TO lif WITH EMPTY KEY.
DELETE tab WHERE table_line->wrong <> 'true'.`;
    const issues = runProgram(abap);
    expect(issues[0].getMessage()).to.contain("wrong");
  });

  it("submatches", () => {
    const abap = `
DATA abap_doc_string TYPE string.
DATA foo TYPE string.
FIND FIRST OCCURRENCE OF REGEX 'sdfsdf' IN abap_doc_string RESULTS DATA(content_encoding_occurrences).
DATA(match) = content_encoding_occurrences-submatches.
IF lines( match ) >= 1.
  DATA(first_match) = match[ 1 ].
  foo = abap_doc_string+first_match-offset(first_match-length).
ENDIF.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FS tables, ok", () => {
    const abap = `
DATA lt_tables TYPE STANDARD TABLE OF string.
FIELD-SYMBOLS <f1> TYPE HASHED TABLE.
FIELD-SYMBOLS <f2> TYPE STANDARD TABLE.
FIELD-SYMBOLS <f3> TYPE ANY TABLE.
FIELD-SYMBOLS <f4> TYPE INDEX TABLE.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("DATA hashed table key not defined, expect error", () => {
    const abap = `DATA lt_tables TYPE HASHED TABLE OF string.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("generic");
  });

  it("DATA type any, expect error", () => {
    const abap = `DATA lt_tables TYPE any.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("generic");
  });

  it("ok, not generic", () => {
    const abap = `DATA table TYPE SORTED TABLE OF i WITH NON-UNIQUE DEFAULT KEY.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, not generic, primary_key", () => {
    const abap = `
types: BEGIN OF TY_TOKEN_ST,
         api_name type string,
         token type string,
       END OF ty_token_st.
types ty_token_tt type hashed TABLE OF ty_token_st with UNIQUE key primary_key components api_name.
data MT_TOKEN type TY_TOKEN_TT.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CALL not found function module in cloud, should give error", () => {
    const abap = `CALL FUNCTION 'NOT_RELEASED'.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.contain("found");
  });

  it("CALL not found function module in cloud destination, ok", () => {
    const abap = `CALL FUNCTION 'NOT_RELEASED' DESTINATION 'SDF'.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CREATE OBJECT, ref to interface", () => {
    const abap = `
INTERFACE lif.
ENDINTERFACE.
DATA foo TYPE REF TO lif.
CREATE OBJECT foo.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("Interface reference, cannot be instantiated");
  });

  it("CALL not found class in cloud, should give error", () => {
    const abap = `CALL METHOD ('CL_NOT_RELEASED')=>foobar.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.contain("not found");
  });

  it("CALL not found class in cloud, ok", () => {
    const abap = `
    DATA lv_name TYPE string.
    lv_name = 'CL_NOT_RELEASED'.
    CALL METHOD (lv_name)=>foobar.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CREATE OBJECT, dynamic type, ok", () => {
    const abap = `
INTERFACE lif.
ENDINTERFACE.
DATA li_auth TYPE REF TO lif.
CREATE OBJECT li_auth TYPE ('ZCL_ABAPGIT_AUTH_EXIT').`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("call method, incompatible types of characters, non named import", () => {
    const abap = `
TYPES ty_char20 TYPE c LENGTH 20.
TYPES ty_char30 TYPE c LENGTH 30.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING var TYPE ty_char20.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA input TYPE ty_char30.
    foo( input ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("call method, incompatible types of characters, named import", () => {
    const abap = `
TYPES ty_char20 TYPE c LENGTH 20.
TYPES ty_char30 TYPE c LENGTH 30.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING var TYPE ty_char20.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA input TYPE ty_char30.
    foo( var = input ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("call method, ok, compatible", () => {
    const abap = `
TYPES ty_char20 TYPE c LENGTH 20.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING var TYPE ty_char20.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( 'foo' ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("call method, ok, compatible, space", () => {
    const abap = `
TYPES ty_char2 TYPE c LENGTH 2.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING var TYPE ty_char2.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( space ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("call method, error, derived from constant too long", () => {
    const abap = `
TYPES ty_char2 TYPE c LENGTH 2.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING var TYPE ty_char2.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( 'foo' ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("call method, ok, generic", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING var TYPE c.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( 'sdf' ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("call method, ok, generic, with default", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING var TYPE c DEFAULT 'sdf'.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( 'sdf' ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("not compatible, tables", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty,
             kind TYPE string,
           END OF ty.
    DATA mt_result TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
    TYPES rt TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    METHODS foo RETURNING VALUE(rt) TYPE rt.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    mt_result = foo( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.contain("Incompatible types");
  });

  it("not compatible, table types", () => {
    const abap = `
TYPES: BEGIN OF ty,
         kind TYPE string,
       END OF ty.
DATA tab1 TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.

TYPES: BEGIN OF ty_result,
         sobjtype TYPE c LENGTH 4,
         sobjname TYPE c LENGTH 40,
       END OF ty_result.
DATA tab2 TYPE STANDARD TABLE OF ty_result WITH DEFAULT KEY.

tab1 = tab2.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.contain("Incompatible types");
  });

  it("not compatible, structure types", () => {
    const abap = `
TYPES: BEGIN OF ty,
         kind TYPE string,
       END OF ty.
DATA dat1 TYPE ty.

TYPES: BEGIN OF ty_result,
         sobjtype TYPE c LENGTH 4,
         sobjname TYPE c LENGTH 40,
       END OF ty_result.
DATA dat2 TYPE ty_result.

dat1 = dat2.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.contain("Incompatible types");
  });

  it("instantiating global interface, error", () => {
    const clas = `
      CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          METHODS bar..
      ENDCLASS.
      CLASS ZCL_FOOBAR IMPLEMENTATION.
        METHOD bar.
          DATA val TYPE REF TO zif_foobar.
          CREATE OBJECT val.
        ENDMETHOD.
      ENDCLASS.`;
    const intf =
      "INTERFACE zif_foobar PUBLIC.\n" +
      "ENDINTERFACE.";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zif_foobar.intf.abap", contents: intf}]);
    expect(issues[0]?.getMessage()).to.contain("Interface reference, cannot be instantiated");
  });

  it("structures, compatible, ok", () => {
    const abap = `
DATA: BEGIN OF data1,
        devclass TYPE c LENGTH 30,
        ctext    TYPE c LENGTH 60,
        as4user  TYPE c LENGTH 8,
      END OF data1.

DATA: BEGIN OF data2,
        devclass TYPE c LENGTH 30,
      END OF data2.

data2 = data1.
data1 = data2.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("input not compatible", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty1,
             devclass TYPE c LENGTH 30,
             dat      TYPE c LENGTH 2,
           END OF ty1.

    TYPES: BEGIN OF ty2,
             devclass TYPE c LENGTH 30,
           END OF ty2.

    METHODS foo.
    METHODS bar IMPORTING data TYPE ty2.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA data1 TYPE ty1.
    bar( data1 ).
  ENDMETHOD.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("input not compatible, basic C and I", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo.
    METHODS bar IMPORTING data TYPE i.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA data1 TYPE c LENGTH 30.
    bar( data1 ).
  ENDMETHOD.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("different field names, same types, ok", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty1,
             devclass1 TYPE c LENGTH 30,
           END OF ty1.

    TYPES: BEGIN OF ty2,
             devclass2 TYPE c LENGTH 30,
           END OF ty2.

    METHODS foo.
    METHODS bar IMPORTING data TYPE ty2.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA data1 TYPE ty1.
    bar( data1 ).
  ENDMETHOD.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("different field names, different types, error", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty1,
             devclass1 TYPE c LENGTH 30,
           END OF ty1.

    TYPES: BEGIN OF ty2,
             devclass2 TYPE i,
           END OF ty2.

    METHODS foo.
    METHODS bar IMPORTING data TYPE ty2.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA data1 TYPE ty1.
    bar( data1 ).
  ENDMETHOD.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("types compatible", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING val TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( '1' ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("types compatible", () => {
    const abap = `
TYPES: BEGIN OF lty_notif,
         mandt TYPE c LENGTH 3,
         guid  TYPE c LENGTH 10,
       END OF lty_notif.

TYPES: BEGIN OF lty_notif_key,
         mandt TYPE c LENGTH 3,
       END OF lty_notif_key.

DATA lt_notif TYPE STANDARD TABLE OF lty_notif.
DATA lt_notif_key TYPE STANDARD TABLE OF lty_notif_key.

lt_notif_key = lt_notif.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("voided lines call", () => {
    const abap = `
TYPES: BEGIN OF ty,
         field TYPE string,
       END OF ty.
DATA voided TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
DATA lv TYPE i.
lv = lines( voided ).`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("SY type field sequence", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_syst_st,
             index      TYPE i,
             pagno      TYPE i,
             tabix      TYPE i,
             tfill      TYPE i,
             tlopc      TYPE i,
             tmaxl      TYPE i,
             toccu      TYPE i,
             ttabc      TYPE i,
             tstis      TYPE i,
             ttabi      TYPE i,
             dbcnt      TYPE i,
             fdpos      TYPE i,
             colno      TYPE i,
             linct      TYPE i,
             linno      TYPE i,
             linsz      TYPE i,
             pagct      TYPE i,
             macol      TYPE i,
             marow      TYPE i,
             tleng      TYPE i,
             sfoff      TYPE i,
             willi      TYPE i,
             lilli      TYPE i,
             subrc      TYPE i,
             fleng      TYPE i,
             cucol      TYPE i,
             curow      TYPE i,
             lsind      TYPE i,
             listi      TYPE i,
             stepl      TYPE i,
             tpagi      TYPE i,
             winx1      TYPE i,
             winy1      TYPE i,
             winx2      TYPE i,
             winy2      TYPE i,
             winco      TYPE i,
             winro      TYPE i,
             windi      TYPE i,
             srows      TYPE i,
             scols      TYPE i,
             loopc      TYPE i,
             folen      TYPE i,
             fodec      TYPE i,
             tzone      TYPE i,
             dayst(1)   TYPE c,
             ftype(1)   TYPE c,
             appli(2)   TYPE x,
             fdayw      TYPE int1,
             ccurs      TYPE p LENGTH 5 DECIMALS 0,
             ccurt      TYPE p LENGTH 5 DECIMALS 0,
             debug(1)   TYPE c,
             ctype(1)   TYPE c,
             input(1)   TYPE c,
             langu(1)   TYPE c,
             modno      TYPE i,
             batch(1)   TYPE c,
             binpt(1)   TYPE c,
             calld(1)   TYPE c,
             dynnr(4)   TYPE c,
             dyngr(4)   TYPE c,
             newpa(1)   TYPE c,
             pri40(1)   TYPE c,
             rstrt(1)   TYPE c,
             wtitl(1)   TYPE c,
             cpage      TYPE i,
             dbnam(20)  TYPE c,
             mandt      TYPE c LENGTH 3,
             prefx(3)   TYPE c,
             fmkey(3)   TYPE c,
             pexpi(1)   TYPE n,
             prini(1)   TYPE n,
             primm(1)   TYPE c,
             prrel(1)   TYPE c,
             playo(5)   TYPE c,
             prbig(1)   TYPE c,
             playp(1)   TYPE c,
             prnew(1)   TYPE c,
             prlog(1)   TYPE c,
             pdest(4)   TYPE c,
             plist(12)  TYPE c,
             pauth(2)   TYPE n,
             prdsn(6)   TYPE c,
             pnwpa(1)   TYPE c,
             callr(8)   TYPE c,
             repi2(40)  TYPE c,
             rtitl(70)  TYPE c,
             prrec(12)  TYPE c,
             prtxt(68)  TYPE c,
             prabt(12)  TYPE c,
             lpass(4)   TYPE c,
             nrpag(1)   TYPE c,
             paart(16)  TYPE c,
             prcop(3)   TYPE n,
             batzs(1)   TYPE c,
             bspld(1)   TYPE c,
             brep4(4)   TYPE c,
             batzo(1)   TYPE c,
             batzd(1)   TYPE c,
             batzw(1)   TYPE c,
             batzm(1)   TYPE c,
             ctabl(4)   TYPE c,
             dbsys(10)  TYPE c,
             dcsys(4)   TYPE c,
             macdb(4)   TYPE c,
             sysid(8)   TYPE c,
             opsys(10)  TYPE c,
             pfkey(20)  TYPE c,
             saprl(4)   TYPE c,
             tcode(20)  TYPE c,
             ucomm(70)  TYPE c,
             cfwae(5)   TYPE c,
             chwae(5)   TYPE c,
             spono(10)  TYPE n,
             sponr(10)  TYPE n,
             waers(5)   TYPE c,
             cdate      TYPE d,
             datum      TYPE d,
             slset(14)  TYPE c,
             subty(1)   TYPE x,
             subcs(1)   TYPE c,
             group(1)   TYPE c,
             ffile(8)   TYPE c,
             uzeit      TYPE t,
             dsnam(8)   TYPE c,
             tabid(8)   TYPE c,
             tfdsn(8)   TYPE c,
             uname(12)  TYPE c,
             lstat(16)  TYPE c,
             abcde(26)  TYPE c,
             marky(1)   TYPE c,
             sfnam(30)  TYPE c,
             tname(30)  TYPE c,
             msgli(60)  TYPE c,
             title(70)  TYPE c,
             entry(72)  TYPE c,
             lisel(255) TYPE c,
             uline(255) TYPE c,
             xcode(70)  TYPE c,
             cprog(40)  TYPE c,
             xprog(40)  TYPE c,
             xform(30)  TYPE c,
             ldbpg(40)  TYPE c,
             tvar0(20)  TYPE c,
             tvar1(20)  TYPE c,
             tvar2(20)  TYPE c,
             tvar3(20)  TYPE c,
             tvar4(20)  TYPE c,
             tvar5(20)  TYPE c,
             tvar6(20)  TYPE c,
             tvar7(20)  TYPE c,
             tvar8(20)  TYPE c,
             tvar9(20)  TYPE c,
             msgid(20)  TYPE c,
             msgty(1)   TYPE c,
             msgno(3)   TYPE n,
             msgv1(50)  TYPE c,
             msgv2(50)  TYPE c,
             msgv3(50)  TYPE c,
             msgv4(50)  TYPE c,
             oncom(1)   TYPE c,
             vline(1)   TYPE c,
             winsl(79)  TYPE c,
             staco      TYPE i,
             staro      TYPE i,
             datar(1)   TYPE c,
             host(32)   TYPE c,
             locdb(1)   TYPE c,
             locop(1)   TYPE c,
             datlo      TYPE d,
             timlo      TYPE t,
             zonlo(6)   TYPE c,
           END OF ty_syst_st.
    METHODS method1 IMPORTING foo TYPE ty_syst_st.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD method1.
    method1( sy ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Version.Cloud);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("sy-repid", () => {
    const abap = `WRITE sy-repid.`;
    const issues = runProgram(abap, [], Version.Cloud, ".");
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("Loop at voided row into data ref", () => {
    const abap = `
DATA tab TYPE STANDARD TABLE OF voided WITH DEFAULT KEY.
LOOP AT tab REFERENCE INTO DATA(sdf).
  WRITE sdf->field.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("voided row table type vs string", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty1,
             field1 TYPE c LENGTH 1,
             field2 TYPE string,
           END OF ty1.
    TYPES tt1 TYPE STANDARD TABLE OF ty1 WITH DEFAULT KEY.

    TYPES: BEGIN OF ty2,
             field1 TYPE c LENGTH 1,
             field2 TYPE voided,
           END OF ty2.
    TYPES tt2 TYPE STANDARD TABLE OF ty2 WITH DEFAULT KEY.

    METHODS method IMPORTING iv TYPE tt1.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD method.
    DATA foo TYPE tt2.
    method( foo ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("String template, missing return parameter", () => {
    const abap = `
CLASS lcl_heap DEFINITION.
  PUBLIC SECTION.
    METHODS add.
ENDCLASS.
CLASS lcl_heap IMPLEMENTATION.
  METHOD add.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA lo_heap TYPE REF TO lcl_heap.
  CREATE OBJECT lo_heap.
  WRITE |<sdf{ lo_heap->add( ) }>|.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("No target type determined");
  });

  it("String template, not character like return type", () => {
    const abap = `
CLASS lcl_heap DEFINITION.
  PUBLIC SECTION.
    METHODS add RETURNING VALUE(ref) TYPE REF TO lcl_heap.
ENDCLASS.
CLASS lcl_heap IMPLEMENTATION.
  METHOD add.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA lo_heap TYPE REF TO lcl_heap.
  CREATE OBJECT lo_heap.
  WRITE |<sdf{ lo_heap->add( ) }>|.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not character like");
  });

  it("write hex via string template", () => {
    const abap = `
DATA foo TYPE x LENGTH 10.
WRITE |{ foo }|.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("write xstring via string template", () => {
    const abap = `
DATA foo TYPE xstring.
WRITE |{ foo }|.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("write xsequence via string template", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING bar TYPE xsequence.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    WRITE |{ bar }|.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, types offset/length, character", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty TYPE c LENGTH 2.
    CLASS-METHODS foo IMPORTING field TYPE ty.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA bar TYPE c LENGTH 3.
  lcl=>foo( bar(2) ).
  lcl=>foo( bar+1(2) ).
  lcl=>foo( bar+1 ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, types offset/length, hex", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty TYPE x LENGTH 2.
    CLASS-METHODS foo IMPORTING field TYPE ty.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA bar TYPE x LENGTH 3.
  lcl=>foo( bar(2) ).
  lcl=>foo( bar+1(2) ).
  lcl=>foo( bar+1 ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("error, hex length doesnt match", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty TYPE x LENGTH 2.
    CLASS-METHODS foo IMPORTING field TYPE ty.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA bar TYPE x LENGTH 3.
  lcl=>foo( bar ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("Method parameter type not compatible");
  });

  it("error, char vs string", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING str TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA cval TYPE c LENGTH 20.
    foo( cval ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("Method parameter type not compatible");
  });

  it("ok, char vs string", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING str TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( 'abc' ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, char vs string, another ok", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING str TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( \` \` ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("to_upper, chars", () => {
    const abap = `
DATA lv_char TYPE c LENGTH 2.
lv_char = to_upper( lv_char ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("condense, chars", () => {
    const abap = `
DATA lv_char TYPE c LENGTH 2.
lv_char = condense( lv_char ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("error, string template alpha vs integer", () => {
    const abap = `
DATA bar TYPE c LENGTH 10.
bar = |{ 626 ALPHA = IN }|.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("ALPHA");
  });

  it("ok, string template alpha vs integer", () => {
    const abap = `
DATA bar TYPE c LENGTH 10.
bar = |{ '626' ALPHA = IN }|.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, moves int8 vs i", () => {
    const abap = `
DATA a TYPE i.
DATA b TYPE int8.
a = b.
b = a.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("error, in8 vs i", () => {
    const abap = `
  CLASS lcl DEFINITION.
    PUBLIC SECTION.
      CLASS-METHODS foo IMPORTING val TYPE i.
  ENDCLASS.

  CLASS lcl IMPLEMENTATION.
    METHOD foo.
    ENDMETHOD.
  ENDCLASS.

  START-OF-SELECTION.
    DATA lv TYPE int8.
    lcl=>foo( lv ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("Method parameter type not compatible");
  });

  it("error, in8 vs string", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS foo IMPORTING val TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA lv TYPE int8.
  lcl=>foo( lv ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("Method parameter type not compatible");
  });

  it("write int8, ok", () => {
    const abap = `
  DATA val TYPE int8.
  val = 2.
  WRITE val.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("GET BIT, error not byte like", () => {
    const abap = `
DATA lv_int TYPE i.
GET BIT 1 OF lv_int INTO DATA(lv_bit).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("byte-like");
  });

  it("SET BIT, error not byte like", () => {
    const abap = `
DATA lv_int TYPE i.
SET BIT 1 OF lv_int.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("byte-like");
  });

  it("hex to clike not possible", () => {
    const abap = `
DATA hex TYPE xstring.
DATA int TYPE i.
int = strlen( hex ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("string to hexlike not possible", () => {
    const abap = `
DATA str TYPE string.
DATA int TYPE i.
int = xstrlen( str ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("ok, string constant to xsequence", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING bar TYPE xsequence.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( \`\` ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("concatenated constant to xstring, &&", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS foo IMPORTING val TYPE xstring.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  lcl=>foo( 'AA' && 'AA' ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("concatenated constant to xstring, string template", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS foo IMPORTING val TYPE xstring.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  lcl=>foo( |AA| ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("concatenated constant to xstring, string template, calculated", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS foo IMPORTING val TYPE xstring.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA str TYPE string.
  lcl=>foo( str && |A| ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("template into xstring, ok", () => {
    const abap = `
DATA foo TYPE xstring.
foo = |AA|.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(0);
  });

  it("float passed to int", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS foo IMPORTING i TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA f TYPE f.
  lcl=>foo( f ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("string passed to int", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS foo IMPORTING i TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA in TYPE string.
  lcl=>foo( in ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("concate in byte mode, ok", () => {
    const abap = `
DATA hex1 TYPE x LENGTH 1.
DATA hex2 TYPE x LENGTH 1.
CONCATENATE hex1 hex2 INTO DATA(sdf) IN BYTE MODE.
WRITE xstrlen( sdf ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, generic x parameter", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS generic CHANGING f TYPE x.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD generic.
    f+0(1) = f+1(1).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, method structured returning", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty_char10 TYPE c LENGTH 10.
    CLASS-METHODS method1 IMPORTING char10 TYPE ty_char10.
    TYPES: BEGIN OF ty,
             field TYPE c LENGTH 5,
           END OF ty.
    CLASS-METHODS method2 RETURNING VALUE(struc) TYPE ty.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD method1.
  ENDMETHOD.
  METHOD method2.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  lcl=>method1( lcl=>method2( )-field ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("no loop target, requires header line", () => {
    const abap = `
DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
LOOP AT tab FROM 1 TO 2.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("no header");
  });

  it("TRANSPORTING NO FIELDS, only with WHERE", () => {
    const abap = `
DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
LOOP AT tab FROM 1 TO 2 TRANSPORTING NO FIELDS.
ENDLOOP.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("TRANSPORTING NO FIELDS only with WHERE");
  });

  it("calculated float to integer, method, ok", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING int TYPE i.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA val TYPE f.
    foo( val + 1 ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("calculated float to integer, move, ok", () => {
    const abap = `
DATA val TYPE f.
DATA int TYPE i.
int = val + 1.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("to_mixed", () => {
    const abap = `
DATA m TYPE string.
m = to_mixed( val = |Hello World| sep  = | | ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("string to int, ok", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING int TYPE i.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( \`412\` ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("bit-not, variable not found", () => {
    const abap = `
DATA hex TYPE x LENGTH 1.
hex = BIT-NOT sdf.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("plus, variable not found", () => {
    const abap = `
DATA hex TYPE x LENGTH 1.
hex = + sdf.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });

  it("constant hex to xstring, not compatible", () => {
    const abap = `
CONSTANTS gc_magic TYPE x LENGTH 4 VALUE '11223344'.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS moo IMPORTING iv TYPE xstring.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD moo.
    moo( gc_magic ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("Method parameter type not compatible");
  });

  it("xstring to hex, not compatible", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty_hex TYPE x LENGTH 8.
    METHODS foo IMPORTING hex TYPE ty_hex.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA xstr TYPE xstring.
    foo( xstr ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("Method parameter type not compatible");
  });

  it("xstring to int, not compatible", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING int TYPE i.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA xstr TYPE xstring.
    foo( xstr ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("Method parameter type not compatible");
  });

  it("no problem, dereferences", () => {
    const abap = `
FIELD-SYMBOLS <lv_data> TYPE any.
ASSIGN COMPONENT 'ASDF' OF STRUCTURE <lv_data> TO FIELD-SYMBOL(<lv_field>).
ASSIGN <lv_field>->* TO FIELD-SYMBOL(<lv_value>).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(0);
  });

  it("repeat(), occ, type ok", () => {
    const abap = `
DATA: character TYPE string,
      reps      TYPE string.
WRITE |{ repeat( val = character occ = reps ) }|.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok, compatible", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty TYPE c LENGTH 2.

    METHODS foo IMPORTING bar TYPE string.
    METHODS bar RETURNING VALUE(asdf) TYPE ty.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( bar = bar( ) ).
  ENDMETHOD.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok, constant string vs generic C", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING bar TYPE c.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( |sdf| ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok, calculated string vs generic C", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING bar TYPE c.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA lv_str TYPE string.
    foo( lv_str && |s| ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(0);
  });

  it("error expected, string is not compatible with generic C", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING bar TYPE c.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA lv_str TYPE string.
    foo( lv_str ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("error expected, obj into xsequence", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run IMPORTING foo TYPE xsequence.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA lo TYPE REF TO lcl.
  lcl=>run( lo ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not compatible");
  });

  it("must supply argument to lines()", () => {
    const abap = `WRITE lines( ).`;
    const issues = runProgram(abap);
    expect(issues[0]).to.not.equal(undefined);
    expect(issues[0]?.getMessage()).to.contain("must be supplied");
  });

  it("tab into char, not compatible", () => {
    const abap = `
DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
DATA char TYPE c LENGTH 1.
char = tab.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("Incompatible types");
  });

  it("TRANSPORTING field not found in source", () => {
    const abap = `
TYPES: BEGIN OF ty,
         field1 TYPE i,
       END OF ty.
DATA tab TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
DATA row TYPE ty.
READ TABLE tab INDEX 1 INTO row TRANSPORTING noooo.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not found");
  });

  it("Generic class data, error expected", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-DATA gt_backup TYPE SORTED TABLE OF any.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("generic");
  });

  it("TYPES, check for generics", () => {
    const abap = `
TYPES: BEGIN OF ty_backup,
         name   TYPE string,
         backup TYPE any,
       END OF ty_backup.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("generic");
  });

  it("object ref to simple, not compatible", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING val TYPE simple.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( me ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("Method parameter type not compatible");
  });

  it("itab to simple, not compatible", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING val TYPE simple.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    foo( tab ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("Method parameter type not compatible");
  });

  it("dynamic assign, interface", () => {
    const abap = `
INTERFACE foo.
  CONSTANTS foo TYPE string VALUE 'moo'.
ENDINTERFACE.

START-OF-SELECTION.
  FIELD-SYMBOLS <bar> TYPE any.
  ASSIGN foo=>('FOO') TO <bar>.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(0);
  });

  it("dynamic assign, class", () => {
    const abap = `
CLASS clas DEFINITION.
  PUBLIC SECTION.
    CONSTANTS foo TYPE string VALUE 'moo'.
ENDCLASS.

CLASS clas IMPLEMENTATION.
ENDCLASS.

START-OF-SELECTION.
  FIELD-SYMBOLS <bar> TYPE any.
  ASSIGN clas=>('FOO') TO <bar>.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(0);
  });

  it("syntax error, inline not possible in this position,", () => {
    const abap = `
DATA: BEGIN OF ls_foo,
        bar TYPE i,
      END OF ls_foo.
MOVE-CORRESPONDING ls_foo TO data(ls_attri).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`"data" not found`);
  });

  it("sorted table cannot be sorted", () => {
    const abap = `
TYPES: BEGIN OF ty,
         text  TYPE t100-text,
         msgnr TYPE t100-msgnr,
       END OF ty.
DATA lt_t100 TYPE SORTED TABLE OF ty WITH UNIQUE KEY text.
SORT lt_t100 BY text.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`sorted`);
  });

  it("types already defined, constants vs types 1", () => {
    const abap = `
INTERFACE lcl1.
  TYPES foo TYPE i.
  DATA foo TYPE i.
ENDINTERFACE.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`already`);
  });

  it("types already defined, constants vs types 1", () => {
    const abap = `
INTERFACE lcl2.
  TYPES foo TYPE i.
  CONSTANTS foo TYPE i VALUE 2.
ENDINTERFACE.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`already`);
  });

  it("types already defined, constants vs types 1", () => {
    const abap = `
INTERFACE lcl3.
  DATA foo TYPE i.
  TYPES foo TYPE i.
ENDINTERFACE.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`already`);
  });

  it("types already defined, constants vs types 1", () => {
    const abap = `
INTERFACE lcl4.
  CONSTANTS foo TYPE i VALUE 2.
  TYPES foo TYPE i.
ENDINTERFACE.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`already`);
  });

  it("Ok, levels", () => {
    const abap = `
TYPES foo TYPE i.
INTERFACE lcl1.
  DATA foo TYPE i.
ENDINTERFACE.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(0);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("Ok, in method", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD bar.
    TYPES foo TYPE i.
    DATA foo TYPE i.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equal(0);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("incompatible type, const int into string", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS method1 IMPORTING str TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD method1.
    method1( 123 ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("incompatible type, int into int8 table", () => {
    const abap = `DATA tab TYPE STANDARD TABLE OF int8 WITH DEFAULT KEY.
DATA int TYPE i.
INSERT int INTO TABLE tab.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("incompatible type, int into int8 table, method", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS bar IMPORTING foo TYPE int8.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD bar.
    DATA int TYPE i.
    bar( int ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("insert lines, compatible", () => {
    const abap = `
DATA tab1 TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
DATA tab2 TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
INSERT LINES OF tab1 INTO TABLE tab2.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("ok, int8", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING sdf TYPE int8.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( 8 ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("INSERT INITIAL LINE", () => {
    const abap = `
TYPES: BEGIN OF abap_componentdescr,
         name       TYPE string,
         type       TYPE i,
         as_include TYPE abap_bool,
         suffix     TYPE string,
       END OF abap_componentdescr.
TYPES abap_component_tab TYPE STANDARD TABLE OF abap_componentdescr WITH DEFAULT KEY.
DATA lt_components TYPE abap_component_tab.
FIELD-SYMBOLS <ls_component> TYPE abap_componentdescr.
INSERT INITIAL LINE INTO lt_components ASSIGNING <ls_component> INDEX 1.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("packed1, DECIMALS must be specified in OO context", () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    TYPES foo TYPE p LENGTH 10.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = runClass(abap);
    expect(issues[0].getMessage()).to.contain("Specify DECIMALS");
  });

  it("packed2, DECIMALS must be specified in OO context", () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    TYPES foo TYPE p.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = runClass(abap);
    expect(issues[0].getMessage()).to.contain("Specify DECIMALS");
  });

  it("INSERT INITIAL LINE, ok", () => {
    const abap = `
TYPES: BEGIN OF ty_language,
         spras TYPE i,
       END OF ty_language.
DATA it_language TYPE STANDARD TABLE OF ty_language WITH DEFAULT KEY.
INSERT INITIAL LINE INTO it_language INDEX 1.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("incompatible type, string into structure", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_data,
             content_type TYPE string,
             data         TYPE string,
           END OF ty_data.
    METHODS foo.
    METHODS data RETURNING VALUE(str) TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA ls_data TYPE ty_data.
    ls_data = data( ).
  ENDMETHOD.

  METHOD data.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("Incompatible types");
  });

  it("incompatible type, structure into char", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty_char20 TYPE c LENGTH 20.
    METHODS method1 IMPORTING char TYPE ty_char20.
    METHODS method2.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD method1.
  ENDMETHOD.

  METHOD method2.
    DATA: BEGIN OF struc,
            short TYPE c LENGTH 10,
          END OF struc.
    method1( struc ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("incompatible type, int into packed", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty TYPE p LENGTH 11 DECIMALS 0.
    METHODS foo IMPORTING pp TYPE ty.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA int TYPE i.
    foo( int ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("ok, int from code into packed", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty TYPE p LENGTH 6 DECIMALS 1.
    METHODS foo IMPORTING bar TYPE ty.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( 22 ) .
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("error for no field list", () => {
    const abap = `DATA target TYPE tab.
SELECT SINGLE FROM tab INTO target.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("fields missing");
  });

  it("ok, field list", () => {
    const abap = `DATA target TYPE tab.
    SELECT ddtext INTO target FROM dd07t.
    ENDSELECT.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("not compatible, object vs cls", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING obj TYPE REF TO lcl.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA o TYPE REF TO object.
    o = obj. " this is okay
    foo( o ). " this should give an error
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("ok, SELECT into field list, low syntax dynamic", () => {
    const abap = `
    DATA lv_created TYPE sy-uname.
    DATA lv_changed TYPE sy-uname.
    SELECT created_by changed_by INTO (lv_created, lv_changed) FROM ('/IWBEP/I_V4_MSRV').
    ENDSELECT.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("ok, SELECT dynamic field list", () => {
    const abap = `
TYPES:
  BEGIN OF ty_domain_value,
    domvalue_l TYPE domvalue_l,
    valpos     TYPE valpos,
    appval     TYPE ddappval,
    ddtext     TYPE val_text,
  END OF ty_domain_value.

DATA: lv_columns TYPE string,
      lv_tables  TYPE string,
      lv_where   TYPE string,
      ls_value   TYPE ty_domain_value,
      lv_order   TYPE string.

SELECT (lv_columns) FROM (lv_tables)
  INTO (ls_value-domvalue_l, ls_value-ddtext)
  WHERE (lv_where) ORDER BY (lv_order).

ENDSELECT.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("ok, sy-repid with offset", () => {
    const abap = `
    IF sy-repid+0(1) = 'A'.
    ENDIF.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("not compatible, xstring into string", () => {
    const abap = `CLASS lcl DEFINITION.
    PUBLIC SECTION.
      CLASS-METHODS foo
        IMPORTING
          bar TYPE string.
  ENDCLASS.
  CLASS lcl IMPLEMENTATION.
    METHOD foo.
      DATA xstr TYPE xstring.
      foo( xstr ).
    ENDMETHOD.
  ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("structure into basic, not compatible", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS moo IMPORTING int TYPE i.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD moo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA: BEGIN OF dat,
          foo TYPE i,
        END OF dat.
  lcl=>moo( dat ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("error, static call of instance method", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  lcl=>foo( ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain(" not static");
  });

  it("error, component name is a ref to object", () => {
    const abap = `FIELD-SYMBOLS <lg_any> TYPE any.
DATA compo TYPE REF TO object.
ASSIGN COMPONENT compo OF STRUCTURE <lg_any> TO <lg_any>.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("component name must be charlike");
  });

  it("ok, assign component", () => {
    const abap = `FIELD-SYMBOLS <lg_any> TYPE any.
ASSIGN COMPONENT 2 OF STRUCTURE <lg_any> TO <lg_any>.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("error, not charlike1", () => {
    const abap = `DATA: BEGIN OF foo,
    int TYPE i,
  END OF foo.
WRITE |{ foo }|.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not character like");
  });

  it("error, not charlike2", () => {
    const abap = `DATA: BEGIN OF foo,
    int TYPE c LENGTH 10,
  END OF foo.
WRITE |{ foo }|.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not character like");
  });

  it("error, constructor method in interface", () => {
    const abap = `INTERFACE lif.
  METHODS constructor.
ENDINTERFACE.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("Interfaces cannot have constructor methods");
  });

  it("Missing FROM", () => {
    const abap = `TYPES: BEGIN OF ty,
    strkorr TYPE c LENGTH 20,
  END OF ty.
DATA lt_e070 TYPE STANDARD TABLE OF ty WITH EMPTY KEY.
TYPES: BEGIN OF ty2,
    trkorr TYPE c LENGTH 20,
  END OF ty2.
DATA rt_trkorr TYPE STANDARD TABLE OF ty2 WITH EMPTY KEY.

SELECT trkorr INTO TABLE rt_trkorr
  FOR ALL ENTRIES IN lt_e070
  WHERE trkorr = lt_e070-strkorr
  AND trfunction = '2'.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("Missing FROM");
  });

  it("not compatible, CREATE OBJECT", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING foo TYPE xstring.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA lo TYPE REF TO lcl.
  CONSTANTS lc_hex TYPE x LENGTH 3 VALUE '290000'.
  CREATE OBJECT lo EXPORTING foo = lc_hex.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("not compatible, NEW", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING foo TYPE xstring.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA lo TYPE REF TO lcl.
  CONSTANTS lc_hex TYPE x LENGTH 3 VALUE '290000'.
  lo = NEW #( lc_hex ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not compatible");
  });

  it("Method already declared in super", () => {
    const abap = `CLASS sup DEFINITION.
  PUBLIC SECTION.
    METHODS methodname.
ENDCLASS.

CLASS sup IMPLEMENTATION.
  METHOD methodname.
  ENDMETHOD.
ENDCLASS.

CLASS lcl DEFINITION INHERITING FROM sup.
  PUBLIC SECTION.
    METHODS methodname.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD methodname.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("already declared");
  });

  it("Method already declared in super, but ok, its private", () => {
    const abap = `CLASS sup DEFINITION.
  PRIVATE SECTION.
    METHODS methodname.
ENDCLASS.

CLASS sup IMPLEMENTATION.
  METHOD methodname.
  ENDMETHOD.
ENDCLASS.

CLASS lcl DEFINITION INHERITING FROM sup.
  PUBLIC SECTION.
    METHODS methodname.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD methodname.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("Method already declared in super, but error, its private the other way around", () => {
    const abap = `CLASS sup DEFINITION.
  PUBLIC SECTION.
    METHODS methodname.
ENDCLASS.

CLASS sup IMPLEMENTATION.
  METHOD methodname.
  ENDMETHOD.
ENDCLASS.

CLASS lcl DEFINITION INHERITING FROM sup.
  PRIVATE SECTION.
    METHODS methodname.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD methodname.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("already declared");
  });

  it("ok, REDUCE, INIT 2nd", () => {
    const abap = `
TYPES string_table TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
DATA(split) = REDUCE string_table( LET split_input = |sdf|
  split_by    = |.|
  offset      = 0
  IN
  INIT string_result = VALUE string_table( )
   add = ||
  FOR index1 = 0 WHILE index1 <= strlen( split_input )
  NEXT
  string_result = COND #(
  WHEN index1 = strlen( split_input ) OR split_input+index1(1) = split_by
  THEN VALUE #( BASE string_result ( add ) )
  ELSE string_result )
  add    = COND #(
  WHEN index1 = strlen( split_input ) OR split_input+index1(1) = split_by
  THEN ||
  ELSE |{ add }{ split_input+index1(1) }| ) ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("Method already declared in super, via alias, expect error", () => {
    const abap = `INTERFACE lif.
  METHODS get.
ENDINTERFACE.

CLASS top DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
    ALIASES get FOR lif~get.
ENDCLASS.
CLASS top IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
ENDCLASS.

CLASS sub DEFINITION INHERITING FROM top.
  PUBLIC SECTION.
    METHODS get.
ENDCLASS.
CLASS sub IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("already declared");
  });

  it("Constant already declared in super, via alias, expect error", () => {
    const abap = `INTERFACE lif.
  CONSTANTS get TYPE i VALUE 2.
ENDINTERFACE.

CLASS top DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
    ALIASES get FOR lif~get.
ENDCLASS.
CLASS top IMPLEMENTATION.
ENDCLASS.

CLASS sub DEFINITION INHERITING FROM top.
  PUBLIC SECTION.
    METHODS get.
ENDCLASS.
CLASS sub IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("already declared");
  });

  it("class constructors, ok", () => {
    const abap = `CLASS sup DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS class_constructor.
ENDCLASS.
CLASS sup IMPLEMENTATION.
  METHOD class_constructor.
  ENDMETHOD.
ENDCLASS.

CLASS lcl DEFINITION INHERITING FROM sup.
  PUBLIC SECTION.
    CLASS-METHODS class_constructor.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD class_constructor.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("ok, select from internal tab", () => {
    const abap = `TYPES: BEGIN OF ty,
    dat TYPE d,
  END OF ty.
DATA tab TYPE STANDARD TABLE OF ty.
SELECT SINGLE MIN( dat ) AS date
  FROM @tab AS t1
  INTO @DATA(lv_datum).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("voided TYPE STRUTURE", () => {
    const abap = `
DATA ls_data TYPE STRUCTURE FOR HIERARCHY /foo/bar.
CLEAR ls_data.`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("DEFAULT, infer type", () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    DATA(sdf) = VALUE #( tab[ 1 ] DEFAULT VALUE #( ) ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("ASSIGN component inline fs", () => {
    const abap = `
TYPES: BEGIN OF test,
         comp TYPE REF TO data,
       END OF test.
DATA var TYPE test.
ASSIGN COMPONENT 'COMP' OF STRUCTURE var TO FIELD-SYMBOL(<fs>).
ASSIGN <fs>->* TO FIELD-SYMBOL(<fs2>).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("ok, clike structure", () => {
    const abap = `
TYPES: BEGIN OF st_160,
         field1 TYPE c LENGTH 18,
         field2 TYPE c LENGTH 10,
       END OF st_160.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS moo IMPORTING data TYPE clike.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD moo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA foo TYPE st_160.
  lcl=>moo( foo ).`;
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it.skip("fields inside TYPES cannot be generic", () => {
    const abap = `
TYPES: BEGIN OF ty,
         foo TYPE i,
       END OF ty.
TYPES: BEGIN OF ty_internal,
         dd05m TYPE TABLE OF ty,
       END OF ty_internal.`;
    const issues = runProgram(abap);
    expect(issues[0].getMessage()).to.contain("generic");
  });

  it("ref into structure, expect error", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty,
             foobar TYPE voided,
           END OF ty.
    METHODS foo IMPORTING struc TYPE ty.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA ref TYPE REF TO lcl.
    foo( ref ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal("Method parameter type not compatible");
  });

  it("xstring offset/length in writer position not possible", () => {
    const abap = `
DATA xstr TYPE xstring.
xstr+10 = 'AA'.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal("xstring/string offset/length in writer position not possible");
  });

  it("xstring offset/length in writer position not possible", () => {
    const abap = `
DATA xstr TYPE xstring.
xstr(1) = 'AA'.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal("xstring/string offset/length in writer position not possible");
  });

  it("string offset/length in writer position not possible", () => {
    const abap = `
DATA str TYPE string.
str+10 = 'AA'.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal("xstring/string offset/length in writer position not possible");
  });

  it("string offset/length in writer position not possible", () => {
    const abap = `
DATA str TYPE string.
str(1) = 'AA'.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal("xstring/string offset/length in writer position not possible");
  });

  it("CHANGING parameter must be supplied", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo
      IMPORTING sdfs TYPE string
      CHANGING chang TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA lo TYPE REF TO lcl.
  lo->foo( 'sdf' ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(`Method "foo" has more than one importing or changing parameter`);
  });

  it("error if instantiating interface", () => {
    const abap = `
INTERFACE lif.
ENDINTERFACE.

START-OF-SELECTION.
  DATA foo TYPE REF TO lif.
  foo = NEW #( ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(`lif is an interface, cannot be instantiated`);
  });

  it("dynamic assign", () => {
    const abap = `
CLASS zlcl DEFINITION.
ENDCLASS.

CLASS zlcl IMPLEMENTATION.
ENDCLASS.

START-OF-SELECTION.
  FIELD-SYMBOLS <any> TYPE any.
  ASSIGN zlcl=>('INSTANCE') TO <any>.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("dynamic assign, 2", () => {
    const abap = `
CLASS zlcl DEFINITION.
  public section.
    class-data ref type ref to voided.
ENDCLASS.

CLASS zlcl IMPLEMENTATION.
ENDCLASS.

START-OF-SELECTION.
  FIELD-SYMBOLS <any> TYPE any.
  ASSIGN (zlcl=>ref)=>('INSTANCE') TO <any>.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("concatenate, must be charlike", () => {
    const abap = `
DATA lv_bit TYPE i.
DATA lv_bits TYPE string.
CONCATENATE lv_bit lv_bits INTO lv_bits.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal("Source type not compatible");
  });

  it("constructor, ok, its a calculated value", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING bar TYPE i.
    CLASS-METHODS ret RETURNING VALUE(ret) TYPE int8.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
  METHOD ret.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA lo TYPE REF TO lcl.
  CREATE OBJECT lo EXPORTING bar = lcl=>ret( ).`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

// todo, static method cannot access instance attributes
// todo, can a private method access protected attributes?
// todo, readonly fields(constants + enums + attributes flagged read-only)

});
