import {expect} from "chai";
import {UnusedVariables} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {testRuleFixSingle} from "./_utils";

function testFix(input: string, expected: string) {
  testRuleFixSingle(input, expected, new UnusedVariables());
}

async function runMulti(files: MemoryFile[]): Promise<Issue[]> {
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  const rule = new UnusedVariables().initialize(reg);
  let issues: Issue[] = [];
  for (const o of reg.getObjects()) {
    issues = issues.concat(rule.run(o));
  }
  return issues;
}

async function runSingle(abap: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  return new UnusedVariables().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: unused_variables, single file", () => {

  it("test1", async () => {
    const abap = "parser error";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test2", async () => {
    const abap = "parser error.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test3", async () => {
    const abap = "WRITE bar.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test4", async () => {
    const abap = "DATA foo.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("test5", async () => {
    const abap = "DATA foo.\nWRITE foo.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("class with attribute", async () => {
    const abap =
`CLASS lcl_foo DEFINITION.
  PRIVATE SECTION.
    METHODS bar.
    DATA: mv_bits TYPE string.
ENDCLASS.

CLASS lcl_foo IMPLEMENTATION.
  METHOD bar.
    mv_bits = '123'.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("class with method", async () => {
    const abap = `
CLASS lcl_abapgit_zlib_stream DEFINITION.
  PUBLIC SECTION.
    METHODS take_int
      IMPORTING
        !iv_length    TYPE i
      RETURNING
        VALUE(rv_int) TYPE i.
ENDCLASS.

CLASS lcl_abapgit_zlib_stream IMPLEMENTATION.
  METHOD take_int.
    WRITE iv_length TO rv_int.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("dont report unused when there are syntax errors", async () => {
    const abap = `
    DATA lt_bar TYPE STANDARD TABLE OF i.
    APPEND sdfsdf TO lt_bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test, quickfix simple", async () => {
    testFix("DATA foo.", "");
  });

  it("test, quickfix with TYPE", async () => {
    testFix("DATA foo TYPE i.", "");
  });

  it("only one error per identifier", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PRIVATE SECTION.
    METHODS m1.
    DATA field TYPE string.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD m1.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("class attribute referenced via me->", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PRIVATE SECTION.
    METHODS m1.
    DATA field TYPE string.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD m1.
    WRITE me->field.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("method call on object reference", async () => {
    const abap = `
  DATA: lo_zip TYPE REF TO cl_abap_zip.
  lo_zip->save( ).`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("create object", async () => {
    const abap = `
  DATA: lo_zip TYPE REF TO cl_abap_zip.
  CREATE OBJECT lo_zip.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("CALL FUNCTION STARTING NEW TASK", async () => {
    const abap = `
    DATA lv_task TYPE c.
    CALL FUNCTION 'ZFOOBAR' STARTING NEW TASK lv_task.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("DATA with dashes", async () => {
    const abap = `DATA dummy-name TYPE i.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("dummy-name");
  });

  it("CALL METHOD PARAMTER-TABLE", async () => {
    const abap = `
  DATA obj TYPE REF TO object.
  FIELD-SYMBOLS <tab> TYPE ANY TABLE.
  CALL METHOD obj->('METHOD') PARAMETER-TABLE <tab>.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("Used in NEW", async () => {
    const abap = `
    DATA foo TYPE c LENGTH 1.
    NEW cl_void( foo ).`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("SWITCH", async () => {
    const abap = `
  DATA val TYPE abap_bool.
  DATA date TYPE d.
  date = SWITCH #( val
    WHEN abap_true  THEN sy-datum + 1
    WHEN abap_false THEN sy-datum - 1 ).`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("database update", async () => {
    const abap = `
  DATA lv_text TYPE c LENGTH 10.
  UPDATE voided SET areat = lv_text.
  `;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("CREATE OBJECT with dynamic", async () => {
    const abap = `
  DATA obj TYPE REF TO object.
  DATA lv_clsname TYPE string.
  CREATE OBJECT obj TYPE (lv_clsname).
  `;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("INCLUDE, two unused in the include", async () => {
    const abap1 = `INCLUDE zabapgit_forms.`;
    const abap2 = `
    DATA bar TYPE c.
    FORM run.
      DATA lv_ind TYPE string.
    ENDFORM.
    `;
    const xml2 = `
    <?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <PROGDIR>
        <NAME>ZABAPGIT_FORMS</NAME>
        <SUBC>I</SUBC>
        <RLOAD>E</RLOAD>
        <UCCHECK>X</UCCHECK>
       </PROGDIR>
      </asx:values>
     </asx:abap>
    </abapGit>`;
    const issues = await runMulti([
      new MemoryFile("zabapgit.prog.abap", abap1),
      new MemoryFile("zabapgit_forms.prog.abap", abap2),
      new MemoryFile("zabapgit_forms.prog.xml", xml2),
    ]);
    expect(issues.length).to.equal(2);
  });

  it("class implementing interface", async () => {
    const intf = `
INTERFACE zif_bar.
  DATA moo TYPE c LENGTH 1.
  METHODS m1 IMPORTING bar TYPE string.
ENDINTERFACE.`;
    const clas = `
CLASS zcl_bar DEFINITION.
  PRIVATE SECTION.
    INTERFACES: zif_bar.
    DATA foo TYPE c LENGTH 1.
ENDCLASS.

CLASS zcl_bar IMPLEMENTATION.
  METHOD zif_bar~m1.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runMulti([
      new MemoryFile("zcl_bar.clas.abap", clas),
      new MemoryFile("zif_bar.intf.abap", intf),
    ]);
    // todo, interfaces are currently ignored
    expect(issues.length).to.equal(1);
  });

  it("test, quickfix, chained first", async () => {
    testFix(`DATA: foo, bar.
WRITE bar.`, `DATA:  bar.
WRITE bar.`);
  });

  it("double MOVE", async () => {
    const abap = `
    DATA lv_index1 TYPE i.
    DATA lv_index2 TYPE i.
    lv_index1 = lv_index2 = 2.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("WHILE", async () => {
    const abap = `
  DATA lv_int1 TYPE i.
  DATA lv_int2 TYPE i.
  WHILE lv_int1 < lv_int2.
  ENDWHILE.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("SELECT-OPTIONS with dynamic", async () => {
    const abap = `
  DATA lv_name TYPE string VALUE 'TADIR-DEVCLASS'.
  SELECT-OPTIONS s_devcl FOR (lv_name).
  CLEAR s_devcl.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("COND( )", async () => {
    const abap = `
    DATA rb_langa TYPE c.
    DATA(language) = COND #( WHEN rb_langa = abap_true THEN '%' ELSE 'a' ).
    WRITE language.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("EXPORT", async () => {
    const abap = `
DATA:
  lt_values TYPE TABLE OF string,
  lv_id   TYPE c,
  lv_test TYPE string.

EXPORT values = lt_values TO DATABASE rsix(zz) FROM lv_test ID lv_id.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("SELECT loop", async () => {
    const abap = `
    DATA r_result TYPE string.
    SELECT column INTO @r_result UP TO 1 ROWS FROM voided_table.
    ENDSELECT.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("CHECK", async () => {
    const abap = `
    DATA bar TYPE abap_bool.
    CHECK bar = abap_false.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("Table expression", async () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF i.
    DATA index TYPE i.
    WRITE tab[ index ].`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("Variable referenced via ME->", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS constructor.
  PRIVATE SECTION.
    DATA order TYPE string.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD constructor.
    me->order = '2'.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("CONV", async () => {
    const abap = `
    DATA str TYPE string.
    WRITE CONV string( str ).`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("Variable used via LIKE typing", async () => {
    const abap = `
    DATA foo TYPE i.
    DATA bar LIKE foo.
    WRITE bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("Used in REF", async () => {
    const abap = `
    DATA foo TYPE c LENGTH 1.
    DATA(ref) = REF #( foo ).
    CLEAR ref.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("LOG-POINT", async () => {
    const abap = `
  CONSTANTS foo TYPE c VALUE 'F'.
  CONSTANTS bar TYPE c VALUE 'B'.
  LOG-POINT ID zvoid SUBKEY foo FIELDS bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("dynamic function call", async () => {
    const abap = `
  DATA lc_func TYPE funcname VALUE 'SDFSDF'.
  CALL FUNCTION lc_func.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("move-corresponding", async () => {
    const abap = `
FORM foo.
  TYPES: BEGIN OF ty_stru,
           bar TYPE i,
         END OF ty_stru.
  DATA tree TYPE ty_stru.
  DATA structure LIKE tree.
  MOVE-CORRESPONDING structure TO tree.
ENDFORM.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("RAISE EVENT", async () => {
    const abap = `
  DATA lv_action TYPE string.
  RAISE EVENT foobar
    EXPORTING
      action = lv_action.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("NEW", async () => {
    const abap = `
  CLASS lcl_bar DEFINITION.
  ENDCLASS.
  CLASS lcl_bar IMPLEMENTATION.
  ENDCLASS.
  DATA lv_action TYPE string.
  NEW lcl_bar( lv_action ).`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("ASSERT", async () => {
    const abap = `
  DATA bar TYPE c.
  ASSERT 2 = bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("IF with paren", async () => {
    const abap = `
  DATA foo TYPE c.
  IF ( 2 = foo ).
  ENDIF.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

});
