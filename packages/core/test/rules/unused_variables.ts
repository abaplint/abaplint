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
//  console.dir(reg.findIssues());
  const rule = new UnusedVariables().initialize(reg);
  const issues: Issue[] = [];
  for (const o of reg.getObjects()) {
    issues.push(...rule.run(o));
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

  it("SELECT", async () => {
    const abap = "SELECT * FROM bar INTO TABLE @DATA(sdf).";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getFix()).to.equal(undefined);
  });

  it("pragma should suppress issue", async () => {
    const abap = "DATA foo ##NEEDED.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("pseudo comment should suppress issue", async () => {
    const abap = "DATA foo. \"#EC NEEDED";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
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

  it("class attribute referenced", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PRIVATE SECTION.
    METHODS m1.
    DATA field TYPE string.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD m1.
    WRITE field.
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
  UPDATE voided SET areat = lv_text.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("unused variable, modify db", async () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  MODIFY sdfsd FROM TABLE tab.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("unused variable, delete db", async () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DELETE sdfsd FROM TABLE tab.`;
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
WRITE bar.`, `DATA: bar.
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
    expect(issues[0]?.getMessage()).to.equal(undefined);
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

  it("GET PARAMETER", async () => {
    const abap = `
  DATA lv_field TYPE string.
  DATA lv_package TYPE string.
  GET PARAMETER ID lv_field FIELD lv_package.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("SET PARAMETER", async () => {
    const abap = `
  DATA lv_field TYPE string.
  SET PARAMETER ID lv_field FIELD ''.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("insert into table assigning", async () => {
    const abap = `
  FIELD-SYMBOLS <bar> TYPE i.
  DATA tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.
  INSERT 2 INTO TABLE tab ASSIGNING <bar>.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("NEW with inferred type, no unused variables", async () => {
    const abap = `
CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING imp TYPE string.
ENDCLASS.
CLASS lcl_clas IMPLEMENTATION.
  METHOD constructor.
    WRITE imp.
  ENDMETHOD.
ENDCLASS.
FORM bar.
  DATA foo TYPE REF TO lcl_clas.
  DATA(lv_text) = |abc|.
  foo = NEW #( lv_text ).
ENDFORM.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("foo used in inline CAST", async () => {
    const abap = `
  CLASS lcl_clas DEFINITION.
  ENDCLASS.
  CLASS lcl_clas IMPLEMENTATION.
  ENDCLASS.
  FORM bar.
    DATA foo TYPE REF TO lcl_clas.
    CAST lcl_clas( foo ).
  ENDFORM.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("GET BADI", async () => {
    const abap = `
  DATA lr_badi TYPE REF TO cl_blah.
  GET BADI lr_badi.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("READ TABLE", async () => {
    const abap = `
  DATA lv_test TYPE string.
  DATA lv_result TYPE string.
  DATA lt_test TYPE STANDARD TABLE OF string.
  READ TABLE lt_test INTO lv_result WITH KEY table_line = lv_test. "<<< used
  IF sy-subrc = 0.
    WRITE lv_result.
  ENDIF.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("APPEND CORRESPONDING", async () => {
    const abap = `
TYPES:
  BEGIN OF ty_result,
    ci_has_errors TYPE abap_bool,
  END OF ty_result.
DATA ls_tadir TYPE ty_result.
DATA rt_list TYPE STANDARD TABLE OF ty_result WITH EMPTY KEY.
APPEND CORRESPONDING #( ls_tadir ) TO rt_list.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("RAISE EXCEPTION EXPORTING", async () => {
    const abap = `
    DATA bar TYPE string.
    RAISE EXCEPTION TYPE cx_ags_error
      EXPORTING
        textid = bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("SYSTEM-CALL DID", async () => {
    const abap = `
    DATA c_last_error TYPE i.
    DATA blah TYPE i VALUE 87.
    DATA tmp_s TYPE string.
    DATA lv_string TYPE string.

    SYSTEM-CALL ict
      DID
        blah
      PARAMETERS
        tmp_s
        lv_string
        c_last_error.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("SELECT FROM dynamic", async () => {
    const abap = `
  CONSTANTS lc_tabname TYPE tabname VALUE 'ZTEST'.
  DATA lv_test TYPE i.
  SELECT SINGLE * INTO @lv_test FROM (lc_tabname).`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("constant used via LENGTH", async () => {
    const abap = `
    CONSTANTS lc_length TYPE i VALUE 10.
    TYPES ty_name TYPE c LENGTH lc_length.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("basic COLLECT", async () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  DATA var TYPE i.
  COLLECT var INTO tab.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("dynamic ASSIGN", async () => {
    const abap = `
  DATA(lv_sel_opt_name) = |sdfdsfds|.
  ASSIGN (lv_sel_opt_name) TO FIELD-SYMBOL(<fs>).
  WRITE <fs>.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("TRANSFER", async () => {
    const abap = `
  DATA foo TYPE c.
  DATA bar TYPE c.
  TRANSFER foo TO bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("constant in class", async () => {
    const abap = `
CLASS lcl_test DEFINITION FINAL.
  PUBLIC SECTION.
    CONSTANTS c_name_length TYPE i VALUE 90 ##NO_TEXT.
    TYPES ty_name TYPE c LENGTH c_name_length.
ENDCLASS.
CLASS lcl_test IMPLEMENTATION.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("badi", async () => {
    const abap = `
    CONSTANTS c_badi_class TYPE seoclsname VALUE 'CL_TEST'.
    CONSTANTS c_badi_method TYPE seocmpname VALUE 'GET_TEST'.
    DATA lo_badi TYPE REF TO cl_badi_base.
    GET BADI lo_badi TYPE (c_badi_class).
    CALL BADI lo_badi->(c_badi_method).`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("UNPACK", async () => {
    const abap = `
  DATA foo TYPE i.
  DATA bar TYPE c LENGTH 10.
  UNPACK foo TO bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("FORMAT", async () => {
    const abap = `
  DATA lv_color TYPE i.
  FORMAT COLOR = lv_color.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("Table expression", async () => {
    const abap = `
  DATA ref_scan_manager TYPE REF TO sdfsdfsd.
  DATA(back_structure) = ref_scan_manager->structures[ 2 ].
  DATA(sdfs) = ref_scan_manager->statements[ back_structure-stmnt_from ].
  WRITE sdfs.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("Table expression, target", async () => {
    const abap = `
  DATA result TYPE STANDARD TABLE OF string.
  DATA int TYPE i VALUE 1.
  result[ int ] = 'hello'.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("ABSTRACT METHOD", async () => {
    const base = `
CLASS zcl_base DEFINITION PUBLIC ABSTRACT.
  PROTECTED SECTION.
    METHODS inspect_tokens ABSTRACT IMPORTING
      index TYPE i
      unused TYPE i.
ENDCLASS.
CLASS zcl_base IMPLEMENTATION.
ENDCLASS.`;
    const input = `
CLASS zcl_input DEFINITION PUBLIC INHERITING FROM zcl_base.
  PROTECTED SECTION.
    METHODS inspect_tokens REDEFINITION.
ENDCLASS.
CLASS zcl_input IMPLEMENTATION.
  METHOD inspect_tokens.
    WRITE index.
  ENDMETHOD.
ENDCLASS.`;
    const locals = `
CLASS ltd_check_base DEFINITION INHERITING FROM zcl_base.
  PROTECTED SECTION.
    METHODS inspect_tokens REDEFINITION.
ENDCLASS.
CLASS ltd_check_base IMPLEMENTATION.
  METHOD inspect_tokens.
    RETURN.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runMulti([
      new MemoryFile("zcl_base.clas.abap", base),
      new MemoryFile("zcl_base.clas.locals_imp.abap", locals),
      new MemoryFile("zcl_input.clas.abap", input),
    ]);
    expect(issues.length).to.equal(1);
  });

  it("SET PF-STATUS", async () => {
    const abap = `
    DATA bar TYPE c LENGTH 1 VALUE 'A'.
    SET PF-STATUS bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("SET TITLEBAR", async () => {
    const abap = `
    DATA bar TYPE c LENGTH 1 VALUE 'A'.
    SET TITLEBAR bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("CALL TRANSACTION", async () => {
    const abap = `
  DATA lv_mode TYPE c LENGTH 1 VALUE 'N'.
  DATA lt_batch TYPE STANDARD TABLE OF bdcdata WITH EMPTY KEY.
  DATA lt_messages TYPE STANDARD TABLE OF bdcmsgcoll WITH EMPTY KEY.
  CALL TRANSACTION 'FOOBAR'
    WITH AUTHORITY-CHECK
    USING lt_batch
    MODE lv_mode
    UPDATE 'S'
    MESSAGES INTO lt_messages.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("Report inline, 1", async () => {
    const abap = `
    FORM moo.
      DATA(lv_subrc) = sy-subrc.
    ENDFORM.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("Report inline, 2", async () => {
    const abap = `
    DATA(lv_subrc) = sy-subrc.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("Report inline, 1 ok", async () => {
    const abap = `
    FORM moo.
      DATA(lv_subrc1) = sy-subrc.
      WRITE lv_subrc1.
    ENDFORM.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("Report inline, ok 2", async () => {
    const abap = `
    DATA(lv_subrc2) = sy-subrc.
    WRITE lv_subrc2.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("CATCH INTO is a write", async () => {
    const abap = `
FORM bar.
  TRY.
    CATCH cx_static_check INTO DATA(lo_exc).
      WRITE lo_exc->get_text( ).
  ENDTRY.
ENDFORM.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("REDUCE", async () => {
    const abap = `
  FORM bar.
    TYPES: BEGIN OF ty_record,
        value TYPE i,
      END OF ty_record.
    DATA records TYPE STANDARD TABLE OF ty_record WITH EMPTY KEY.
    DATA(total) = REDUCE i( INIT sum = 0 FOR record IN records NEXT sum = sum + record-value ).
    WRITE total.
  ENDFORM.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("SET HANDLER", async () => {
    const abap = `
  DATA lo_events TYPE REF TO cl_voided.
  SET HANDLER lcl_event_handler=>on_link_click FOR lo_events.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("MESSAGE TYPE var", async () => {
    const abap = `
    DATA lv_msgty TYPE sy-msgty.
    MESSAGE ID 'ABC' TYPE lv_msgty NUMBER '123'.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("Pragma in include", async () => {
    const abap1 = `REPORT ztest_unused_var.
    INCLUDE ztest_unused_var_incl.`;
    const abap2 = `CONSTANTS c_test_incl TYPE i VALUE 1 ##NEEDED.`;

    const issues = await runMulti([
      new MemoryFile("ztest_unused_var.prog.abap", abap1),
      new MemoryFile("ztest_unused_var_incl.prog.abap", abap2),
    ]);
    expect(issues.length).to.equal(0);
  });

  it("WAIT UP TO", async () => {
    const abap = `
  DATA gv_wait TYPE i VALUE 2.
  WAIT UP TO gv_wait SECONDS.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("SHIFT", async () => {
    const abap = `
  DATA lv_temp TYPE string.
  SHIFT lv_temp BY 1 PLACES LEFT.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("SET BIT", async () => {
    const abap = `
    DATA rv_byte8 TYPE x LENGTH 8.
    SET BIT 1 OF rv_byte8 TO 1.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP with GROUP", async () => {
    const abap = `
TYPES: BEGIN OF ty_line,
         request TYPE string,
       END OF ty_line.
DATA t_line TYPE STANDARD TABLE OF ty_line WITH EMPTY KEY.

LOOP AT t_line REFERENCE INTO DATA(os_line)
    WHERE request IS NOT INITIAL
    GROUP BY ( request = os_line->request )
    ASCENDING
    ASSIGNING FIELD-SYMBOL(<t_group>).
  WRITE <t_group>-request.
ENDLOOP.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("SET HANDLER, 2", async () => {
    const abap = `
  DATA lo_events TYPE REF TO cl_voided.
  DATA blah TYPE REF TO cl_voided.
  SET HANDLER blah->on_link_click FOR lo_events.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("REDUCE", async () => {
    const abap = `
TYPES: BEGIN OF ty_bar,
         value TYPE i,
       END OF ty_bar.
DATA value_requests TYPE STANDARD TABLE OF ty_bar WITH EMPTY KEY.
DATA value TYPE i.

DATA(result) = REDUCE int2(
  INIT x = 0
  FOR value_request IN value_requests
  WHERE ( value = value )
  NEXT x = x + 1 ).
WRITE result.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("variable used in voided method call", async () => {
    const abap = `
DATA bar TYPE i.
cl_voided=>void( bar = bar ).`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CALL TRANSFORMATION", async () => {
    const abap = `
  DATA lv_name TYPE string.
  DATA lv_xml TYPE string.
  DATA rv_res TYPE string.

  CALL TRANSFORMATION (lv_name)
      SOURCE XML lv_xml
      RESULT XML rv_res.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("CALL TRANSFORMATION, 2", async () => {
    const abap = `
  DATA lv_name TYPE string.
  DATA lv_xml TYPE string.
  DATA rv_res TYPE string.

  CALL TRANSFORMATION (lv_name)
      SOURCE foo = lv_xml
      RESULT XML rv_res.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("DELETE REPORT", async () => {
    const abap = `
  DATA gv_prog TYPE string.
  DELETE REPORT gv_prog.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("INSERT TEXTPOOL", async () => {
    const abap = `
    DATA gv_prog TYPE string.
    DATA gt_tpool TYPE textpool_table.
    INSERT TEXTPOOL gv_name FROM gt_tpool.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("GET BADI with filter", async () => {
    const abap = `
    CONSTANTS lc_command_init TYPE c LENGTH 4 VALUE 'INIT'.
    DATA li_badi TYPE REF TO /mbtools/bc_command_badi.
    GET BADI li_badi
      FILTERS
        command = lc_command_init.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("VALUE with FOR", async () => {
    const abap = `
  TYPES ty_tab TYPE STANDARD TABLE OF string WITH EMPTY KEY.
  DATA(result) = VALUE ty_tab(
    FOR i = 0 UNTIL i = 10
    ( |hello| )
    ( |world| ) ).
  WRITE lines( result ).`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("raise with MESSAGE WITH", async () => {
    const abap = `
CLASS lcx_syntax_error DEFINITION CREATE PRIVATE.
  PUBLIC SECTION.
    CLASS-METHODS invalid_calculation_attempt
      IMPORTING operator TYPE string
                left     TYPE string
                right    TYPE string
                previous TYPE REF TO cx_root.
ENDCLASS.

CLASS lcx_syntax_error IMPLEMENTATION.
  METHOD invalid_calculation_attempt.
    RAISE EXCEPTION TYPE lcx_syntax_error MESSAGE e016 WITH operator left right
      EXPORTING previous = previous.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("unused and loop at screen", async () => {
    const abap = `
    DATA unused TYPE string.
    LOOP AT SCREEN.
    ENDLOOP.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.include("unused");
  });

  it("unused and loop at screen, 2", async () => {
    const abap = `
    LOOP AT SCREEN.
      DATA unused TYPE string.
    ENDLOOP.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.include("unused");
  });

  it("unused and loop at screen, 3", async () => {
    const abap = `
    LOOP AT SCREEN INTO DATA(unused).
    ENDLOOP.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.include("unused");
  });

  it("constant referred via VALUE", async () => {
    const abap = `
    CONSTANTS const TYPE string VALUE 'value'.
    DATA foo TYPE string VALUE const.
    WRITE foo.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("selection screen TABs should be ignored", async () => {
    const abap = `
  SELECTION-SCREEN:
  BEGIN OF TABBED BLOCK scr_tab FOR 10 LINES,
  TAB (10) scr_tab1 USER-COMMAND scr_push1 DEFAULT SCREEN 100,
  END OF BLOCK scr_tab.`;
    const issues = await runSingle(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

});
