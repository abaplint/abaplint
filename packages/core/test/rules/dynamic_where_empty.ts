import {expect} from "chai";
import {DynamicWhereEmpty, DynamicWhereEmptyConf} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {testRule} from "./_utils";

function form(body: string, declaration = "DATA lv_where TYPE string."): string {
  return `FORM foo USING iv_matnr TYPE string iv_werks TYPE string.
  ${declaration}
  DATA rt TYPE STANDARD TABLE OF marc WITH DEFAULT KEY.
${body}
ENDFORM.`;
}

const conditional = `
  IF iv_matnr IS NOT INITIAL.
    lv_where = |MATNR = @IV_MATNR|.
  ENDIF.`;

const tests = [
  {abap: `parser error`, cnt: 0},

  // the example from the description
  {abap: form(`
  IF iv_matnr IS NOT INITIAL.
    lv_where = |MATNR = @IV_MATNR|.
  ENDIF.
  IF iv_werks IS NOT INITIAL.
    lv_where = |{ lv_where }{ COND #( WHEN lv_where IS NOT INITIAL THEN \` AND \` ) }WERKS = @IV_WERKS|.
  ENDIF.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 1},

  // all statement kinds
  {abap: form(conditional + `
  SELECT * FROM marc INTO TABLE rt WHERE (lv_where).`), cnt: 1},
  {abap: form(conditional + `
  DATA ls TYPE marc.
  SELECT * FROM marc INTO ls WHERE (lv_where).
  ENDSELECT.`), cnt: 1},
  {abap: form(conditional + `
  DATA lv_c TYPE cursor.
  OPEN CURSOR @lv_c FOR SELECT * FROM marc WHERE (lv_where).`), cnt: 1},
  {abap: form(conditional + `
  DELETE FROM marc WHERE (lv_where).`), cnt: 1},
  {abap: form(conditional + `
  UPDATE marc SET werks = 'A' WHERE (lv_where).`), cnt: 1},
  {abap: form(conditional + `
  MODIFY marc FROM ( SELECT * FROM marc WHERE (lv_where) ).`), cnt: 1},

  // never assigned
  {abap: form(`
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 1},
  // VALUE of an empty literal or IS INITIAL
  {abap: form(conditional + `
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`, "DATA lv_where TYPE string VALUE ''."), cnt: 1},
  {abap: form(conditional + `
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`, "DATA lv_where TYPE string VALUE IS INITIAL."), cnt: 1},
  // a table of WHERE lines, appended in a loop
  {abap: form(`
  DATA lt_where TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA lt_filter TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA lv_filter TYPE string.
  LOOP AT lt_filter INTO lv_filter.
    APPEND lv_filter TO lt_where.
  ENDLOOP.
  SELECT * FROM marc WHERE (lt_where) INTO TABLE @rt.`), cnt: 1},
  // assigned in WHILE, DO, CASE without OTHERS, TRY
  {abap: form(`
  DO 1 TIMES.
    lv_where = 'MATNR = 1'.
  ENDDO.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 1},
  {abap: form(`
  CASE iv_matnr.
    WHEN 'A'.
      lv_where = 'MATNR = 1'.
  ENDCASE.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 1},
  {abap: form(`
  TRY.
      lv_where = 'MATNR = 1'.
    CATCH cx_root.
  ENDTRY.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 1},
  // IF with ELSE where one branch does not assign
  {abap: form(`
  IF iv_matnr IS NOT INITIAL.
    lv_where = 'MATNR = 1'.
  ELSE.
    WRITE 'nothing'.
  ENDIF.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 1},
  // cleared after an unconditional assignment
  {abap: form(`
  lv_where = 'MATNR = 1'.
  CLEAR lv_where.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 1},
  // assignment of an empty literal
  {abap: form(`
  lv_where = ''.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 1},
  // the guard does not dominate the statement
  {abap: form(conditional + `
  IF iv_werks IS NOT INITIAL.
    CHECK lv_where IS NOT INITIAL.
  ENDIF.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 1},
  // the statement inside a loop, assigned conditionally before it
  {abap: form(`
  DATA lt_filter TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA lv_filter TYPE string.
  LOOP AT lt_filter INTO lv_filter.
    IF lv_filter IS NOT INITIAL.
      lv_where = lv_filter.
    ENDIF.
    DELETE FROM marc WHERE (lv_where).
  ENDLOOP.`), cnt: 1},
  // method
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS read IMPORTING iv_matnr TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD read.
    DATA lv_where TYPE string.
    DATA rt TYPE STANDARD TABLE OF marc WITH DEFAULT KEY.
    IF iv_matnr IS NOT INITIAL.
      lv_where = |MATNR = @IV_MATNR|.
    ENDIF.
    SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.
  ENDMETHOD.
ENDCLASS.`, cnt: 1},

  // ---------- not reported ----------

  // a static part besides the dynamic token
  {abap: form(conditional + `
  SELECT * FROM marc WHERE mandt = @sy-mandt AND (lv_where) INTO TABLE @rt.`), cnt: 0},
  {abap: form(conditional + `
  DELETE FROM marc WHERE werks = 'A' AND (lv_where).`), cnt: 0},
  // unconditional non-empty assignment before the statement
  {abap: form(`
  lv_where = 'MATNR = 1'.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 0},
  {abap: form(`
  lv_where = |MATNR = @IV_MATNR|.
  IF iv_werks IS NOT INITIAL.
    lv_where = |{ lv_where } AND WERKS = @IV_WERKS|.
  ENDIF.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 0},
  {abap: form(`
  CONCATENATE 'MATNR = ' iv_matnr INTO lv_where.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 0},
  // declared with a non-empty VALUE
  {abap: form(`
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`, "DATA lv_where TYPE string VALUE 'MANDT = SY-MANDT'."), cnt: 0},
  // assigned in all branches
  {abap: form(`
  IF iv_matnr IS NOT INITIAL.
    lv_where = 'MATNR = 1'.
  ELSEIF iv_werks IS NOT INITIAL.
    lv_where = 'WERKS = 1'.
  ELSE.
    lv_where = 'MANDT = SY-MANDT'.
  ENDIF.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 0},
  {abap: form(`
  CASE iv_matnr.
    WHEN 'A'.
      lv_where = 'MATNR = 1'.
    WHEN OTHERS.
      RETURN.
  ENDCASE.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 0},
  // guards
  {abap: form(conditional + `
  IF lv_where IS INITIAL.
    RETURN.
  ENDIF.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 0},
  {abap: form(conditional + `
  IF lv_where IS INITIAL.
    MESSAGE 'No filter' TYPE 'E'.
  ENDIF.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 0},
  {abap: form(conditional + `
  CHECK lv_where IS NOT INITIAL.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 0},
  {abap: form(conditional + `
  CHECK NOT lv_where IS INITIAL.
  DELETE FROM marc WHERE (lv_where).`), cnt: 0},
  {abap: form(conditional + `
  ASSERT lv_where IS NOT INITIAL.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 0},
  {abap: form(conditional + `
  IF lv_where IS NOT INITIAL.
    SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.
  ENDIF.`), cnt: 0},
  {abap: form(conditional + `
  IF lv_where IS INITIAL.
    WRITE 'nothing'.
  ELSE.
    UPDATE marc SET werks = 'A' WHERE (lv_where).
  ENDIF.`), cnt: 0},
  {abap: form(conditional + `
  IF iv_werks IS INITIAL.
    WRITE 'nothing'.
  ELSEIF lv_where IS NOT INITIAL.
    DELETE FROM marc WHERE (lv_where).
  ENDIF.`), cnt: 0},
  // UP TO n ROWS, skipped by default
  {abap: form(conditional + `
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt UP TO 10 ROWS.`), cnt: 0},
  // not a local variable: parameter
  {abap: `FORM foo USING iv_where TYPE string.
  DATA rt TYPE STANDARD TABLE OF marc WITH DEFAULT KEY.
  SELECT * FROM marc WHERE (iv_where) INTO TABLE @rt.
ENDFORM.`, cnt: 0},
  // changed through a reference or a call where it is not a target
  {abap: form(conditional + `
  FIELD-SYMBOLS <lv> TYPE string.
  ASSIGN lv_where TO <lv>.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`), cnt: 0},
  {abap: form(conditional + `
  PERFORM bar CHANGING lv_where.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`) + `
FORM bar CHANGING cv TYPE string.
ENDFORM.`, cnt: 0},
  // the variable only in a subquery
  {abap: form(conditional + `
  SELECT * FROM marc WHERE matnr IN ( SELECT matnr FROM mara WHERE (lv_where) ) INTO TABLE @rt.`), cnt: 0},
  // static WHERE
  {abap: form(`
  SELECT * FROM marc WHERE matnr = @iv_matnr INTO TABLE @rt.`), cnt: 0},
  // outside a procedure
  {abap: `DATA lv_where TYPE string.
DATA rt TYPE STANDARD TABLE OF marc WITH DEFAULT KEY.
SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`, cnt: 0},
];

testRule(tests, DynamicWhereEmpty);

function run(abap: string, conf: Partial<DynamicWhereEmptyConf>): number {
  const rule = new DynamicWhereEmpty();
  const config = new DynamicWhereEmptyConf();
  Object.assign(config, conf);
  rule.setConfig(config);
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  return rule.initialize(reg).run(reg.getFirstObject()!).length;
}

describe("Rule: dynamic_where_empty, options", () => {
  const select = form(conditional + `
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.`);
  const upTo = form(conditional + `
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt UP TO 10 ROWS.`);
  const all = form(conditional + `
  DATA lv_c TYPE cursor.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt.
  OPEN CURSOR @lv_c FOR SELECT * FROM marc WHERE (lv_where).
  DELETE FROM marc WHERE (lv_where).
  UPDATE marc SET werks = 'A' WHERE (lv_where).
  MODIFY marc FROM ( SELECT * FROM marc WHERE (lv_where) ).`);

  it("all statement kinds on by default", () => {
    expect(run(all, {})).to.equal(5);
  });

  it("select off", () => {
    expect(run(all, {select: false})).to.equal(4);
  });

  it("openCursor off", () => {
    expect(run(all, {openCursor: false})).to.equal(4);
  });

  it("deleteDatabase off", () => {
    expect(run(all, {deleteDatabase: false})).to.equal(4);
  });

  it("updateDatabase off", () => {
    expect(run(all, {updateDatabase: false})).to.equal(4);
  });

  it("modifyDatabase off", () => {
    expect(run(all, {modifyDatabase: false})).to.equal(4);
  });

  it("ignoreTables, case insensitive", () => {
    expect(run(select, {ignoreTables: ["MARC"]})).to.equal(0);
    expect(run(all, {ignoreTables: ["marc"]})).to.equal(0);
    expect(run(select, {ignoreTables: ["mara"]})).to.equal(1);
  });

  it("skipUpTo default true", () => {
    expect(run(upTo, {})).to.equal(0);
  });

  it("skipUpTo false", () => {
    expect(run(upTo, {skipUpTo: false})).to.equal(1);
  });

  it("issue position at the variable", () => {
    const rule = new DynamicWhereEmpty();
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", select)).parse();
    const issues = rule.initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("lv_where");
    expect(issues[0].getStart().getRow()).to.equal(8);
  });
});
