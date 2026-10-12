import {expect} from "chai";
import {runMulti} from "./syntax";

function runMethod(body: string, extra = ""): string[] {
  const abap = `
CLASS zcl_loop DEFINITION PUBLIC.
  PUBLIC SECTION.
    TYPES ty_rows TYPE STANDARD TABLE OF i WITH EMPTY KEY.
    DATA mt_rows TYPE ty_rows.
    METHODS run.${extra}
ENDCLASS.

CLASS zcl_loop IMPLEMENTATION.
  METHOD run.
    DATA lt_rows TYPE ty_rows.
    DATA lt_other TYPE ty_rows.
    DATA ls_row TYPE i.
${body}
  ENDMETHOD.
ENDCLASS.`;
  return runMulti([{filename: "zcl_loop.clas.abap", contents: abap}]).map(i => i.getMessage());
}

function runProg(abap: string): string[] {
  return runMulti([{filename: "zloop.prog.abap", contents: abap}]).map(i => i.getMessage());
}

const message = (name: string) => `"${name}" cannot be changed as a whole inside a LOOP over it`;

describe("syntax, the table of an enclosing LOOP changed as a whole", () => {

  it("CLEAR of the loop table", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      CLEAR lt_rows.
    ENDLOOP.`);
    expect(issues).to.deep.equal([message("lt_rows")]);
  });

  it("CLEAR itab[] of the loop table", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      CLEAR lt_rows[].
    ENDLOOP.`);
    expect(issues).to.deep.equal([message("lt_rows")]);
  });

  it("FREE of the loop table", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      FREE lt_rows.
    ENDLOOP.`);
    expect(issues).to.deep.equal([message("lt_rows")]);
  });

  it("REFRESH of the loop table", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      REFRESH lt_rows.
    ENDLOOP.`);
    expect(issues).to.deep.equal([message("lt_rows")]);
  });

  it("assignment of VALUE #( ) to the loop table", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      lt_rows = VALUE #( ).
    ENDLOOP.`);
    expect(issues).to.deep.equal([message("lt_rows")]);
  });

  it("assignment of another table to the loop table", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      lt_rows = lt_other.
    ENDLOOP.`);
    expect(issues).to.deep.equal([message("lt_rows")]);
  });

  it("MOVE to the loop table", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      MOVE lt_other TO lt_rows.
    ENDLOOP.`);
    expect(issues).to.deep.equal([message("lt_rows")]);
  });

  it("chained assignment, the loop table is the second target", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      lt_other = lt_rows = VALUE #( ).
    ENDLOOP.`);
    expect(issues).to.deep.equal([message("lt_rows")]);
  });

  it("attribute as loop table, ASSIGNING", () => {
    const issues = runMethod(`
    LOOP AT mt_rows ASSIGNING FIELD-SYMBOL(<ls_row>).
      CLEAR mt_rows.
    ENDLOOP.`);
    expect(issues).to.deep.equal([message("mt_rows")]);
  });

  it("CLEAR inside a nested LOOP and inside IF, of the outer loop table", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      LOOP AT lt_other INTO DATA(ls_other).
        IF ls_other = ls_row.
          CLEAR lt_rows.
          EXIT.
        ENDIF.
      ENDLOOP.
    ENDLOOP.`);
    expect(issues).to.deep.equal([message("lt_rows")]);
  });

  it("method of a local class in a program", () => {
    const issues = runProg(`
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA lt_rows TYPE STANDARD TABLE OF i WITH EMPTY KEY.
    LOOP AT lt_rows INTO DATA(ls_row).
      CLEAR lt_rows.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.`);
    expect(issues).to.deep.equal([message("lt_rows")]);
  });

  it("ok, DELETE itab WHERE, DELETE current row, MODIFY, APPEND, INSERT", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      DELETE lt_rows WHERE table_line = 2.
      DELETE lt_rows.
      DELETE lt_rows INDEX 1.
      MODIFY lt_rows FROM 3.
      APPEND 4 TO lt_rows.
      INSERT 5 INTO TABLE lt_rows.
    ENDLOOP.`);
    expect(issues).to.deep.equal([]);
  });

  it("ok, SORT is left alone", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      SORT lt_rows.
    ENDLOOP.`);
    expect(issues).to.deep.equal([]);
  });

  it("ok, another table cleared inside the loop", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      CLEAR lt_other.
      lt_other = lt_rows.
    ENDLOOP.`);
    expect(issues).to.deep.equal([]);
  });

  it("ok, the loop table cleared after ENDLOOP and in a following loop over another table", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
    ENDLOOP.
    CLEAR lt_rows.
    LOOP AT lt_other INTO ls_row.
      CLEAR lt_rows.
    ENDLOOP.`);
    expect(issues).to.deep.equal([]);
  });

  it("ok, CLEAR of the work area and the field symbol", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row.
      CLEAR ls_row.
    ENDLOOP.
    LOOP AT lt_rows ASSIGNING FIELD-SYMBOL(<ls_row>).
      CLEAR <ls_row>.
    ENDLOOP.`);
    expect(issues).to.deep.equal([]);
  });

  it("ok, a local table of the same name as the attribute, me->attribute assigned", () => {
    const issues = runMethod(`
    DATA mt_rows TYPE ty_rows.
    LOOP AT mt_rows INTO ls_row.
      me->mt_rows = lt_other.
    ENDLOOP.`);
    expect(issues).to.deep.equal([]);
  });

  it("ok, the loop table cleared in another method", () => {
    const issues = runMethod(`
    LOOP AT mt_rows INTO ls_row.
      clear_rows( ).
    ENDLOOP.
  ENDMETHOD.
  METHOD clear_rows.
    CLEAR mt_rows.`, `
    METHODS clear_rows.`);
    expect(issues).to.deep.equal([]);
  });

  it("ok, through a field symbol and through a reference", () => {
    const issues = runMethod(`
    FIELD-SYMBOLS <lt_rows> TYPE ty_rows.
    DATA lr_rows TYPE REF TO ty_rows.
    ASSIGN lt_rows TO <lt_rows>.
    LOOP AT <lt_rows> INTO ls_row.
      CLEAR <lt_rows>.
      CLEAR lt_rows.
    ENDLOOP.
    lr_rows = REF #( lt_other ).
    LOOP AT lr_rows->* INTO ls_row.
      CLEAR lr_rows->*.
      CLEAR lt_other.
    ENDLOOP.`);
    expect(issues).to.deep.equal([]);
  });

  it("ok, LOOP AT GROUP BY is left alone", () => {
    const issues = runMethod(`
    LOOP AT lt_rows INTO ls_row GROUP BY ls_row INTO DATA(lv_group).
      CLEAR lt_rows.
    ENDLOOP.`);
    expect(issues).to.deep.equal([]);
  });

  it("ok, outside of classes, FORM", () => {
    const issues = runProg(`
FORM run.
  DATA lt_rows TYPE STANDARD TABLE OF i WITH EMPTY KEY.
  LOOP AT lt_rows INTO DATA(ls_row).
    CLEAR lt_rows.
  ENDLOOP.
ENDFORM.

START-OF-SELECTION.
  DATA lt_main TYPE STANDARD TABLE OF i WITH EMPTY KEY.
  LOOP AT lt_main INTO DATA(ls_main).
    CLEAR lt_main.
  ENDLOOP.`);
    expect(issues).to.deep.equal([]);
  });

  it("ok, header line table in a method of a local class, CLEAR works on the header line", () => {
    const issues = runProg(`
DATA gt_rows TYPE STANDARD TABLE OF i WITH HEADER LINE.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA ls_row TYPE i.
    LOOP AT gt_rows INTO ls_row.
      CLEAR gt_rows.
      gt_rows = 2.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.`);
    expect(issues).to.deep.equal([]);
  });

  it("header line table, CLEAR itab[] in a method", () => {
    const issues = runProg(`
DATA gt_rows TYPE STANDARD TABLE OF i WITH HEADER LINE.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA ls_row TYPE i.
    LOOP AT gt_rows INTO ls_row.
      CLEAR gt_rows[].
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.`);
    expect(issues).to.deep.equal([message("gt_rows")]);
  });

});
