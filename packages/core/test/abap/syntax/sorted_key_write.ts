import {expect} from "chai";
import {runMulti} from "./syntax";

function runMethod(body: string): string[] {
  const abap = `
CLASS zcl_sorted DEFINITION PUBLIC.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_sub,
             a TYPE i,
             b TYPE i,
           END OF ty_sub.
    TYPES: BEGIN OF ty_row,
             id   TYPE i,
             name TYPE string,
             sub  TYPE ty_sub,
             val  TYPE i,
           END OF ty_row.
    TYPES ty_sorted TYPE SORTED TABLE OF ty_row WITH UNIQUE KEY id.
    DATA mt_sorted TYPE ty_sorted.
    METHODS run IMPORTING it_generic TYPE ANY TABLE it_sorted_generic TYPE SORTED TABLE.
ENDCLASS.

CLASS zcl_sorted IMPLEMENTATION.
  METHOD run.
    DATA lt_sorted TYPE ty_sorted.
    DATA lt_hashed TYPE HASHED TABLE OF ty_row WITH UNIQUE KEY id name.
    DATA lt_standard TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
    DATA lt_std_key TYPE STANDARD TABLE OF ty_row WITH NON-UNIQUE KEY id.
    DATA lt_sub TYPE SORTED TABLE OF ty_row WITH NON-UNIQUE KEY sub-a.
    DATA lt_secondary TYPE SORTED TABLE OF ty_row WITH UNIQUE KEY id
      WITH NON-UNIQUE SORTED KEY by_val COMPONENTS val.
    DATA lt_std_secondary TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY
      WITH UNIQUE HASHED KEY by_id COMPONENTS id.
    DATA lt_int TYPE SORTED TABLE OF i WITH UNIQUE DEFAULT KEY.
    DATA lt_line TYPE HASHED TABLE OF ty_row WITH UNIQUE KEY table_line.
    DATA lt_default TYPE SORTED TABLE OF ty_row WITH NON-UNIQUE DEFAULT KEY.
    DATA ls_row TYPE ty_row.
    DATA lr_row TYPE REF TO ty_row.
    FIELD-SYMBOLS <ls_row> TYPE ty_row.
    FIELD-SYMBOLS <lv_any> TYPE any.
${body}
  ENDMETHOD.
ENDCLASS.`;
  return runMulti([{filename: "zcl_sorted.clas.abap", contents: abap}]).map(i => i.getMessage());
}

const message = (name: string) => `Key component "${name}" of a sorted or hashed table line cannot be changed`;
const line = `The line of a sorted or hashed table cannot be changed, it is the table key`;

describe("syntax, a write to a key component of a sorted or hashed table line", () => {

  const errors: {abap: string, expected: string}[] = [
    {abap: `LOOP AT lt_sorted ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-id = 2.
    ENDLOOP.`, expected: message("ID")},
    {abap: `LOOP AT lt_sorted ASSIGNING FIELD-SYMBOL(<ls>) WHERE val = 1.
      CLEAR <ls>-id.
    ENDLOOP.`, expected: message("ID")},
    {abap: `LOOP AT mt_sorted ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-id = 2.
    ENDLOOP.`, expected: message("ID")},
    {abap: `LOOP AT me->mt_sorted ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-id = 2.
    ENDLOOP.`, expected: message("ID")},
    {abap: `LOOP AT lt_sorted ASSIGNING <ls_row>.
      <ls_row>-id = 2.
    ENDLOOP.`, expected: message("ID")},
    {abap: `READ TABLE lt_sorted ASSIGNING FIELD-SYMBOL(<ls>) WITH TABLE KEY id = 1.
    IF sy-subrc = 0.
      <ls>-id = 2.
    ENDIF.`, expected: message("ID")},
    {abap: `READ TABLE lt_sorted INDEX 1 ASSIGNING <ls_row>.
    <ls_row>-id = 2.`, expected: message("ID")},
    {abap: `READ TABLE lt_hashed ASSIGNING FIELD-SYMBOL(<ls>) WITH TABLE KEY id = 1 name = 'A'.
    <ls>-name = 'B'.`, expected: message("NAME")},
    {abap: `LOOP AT lt_hashed ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-id = 2.
    ENDLOOP.`, expected: message("ID")},
    {abap: `LOOP AT lt_sub ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-sub-a = 2.
    ENDLOOP.`, expected: message("SUB-A")},
    {abap: `LOOP AT lt_sub ASSIGNING FIELD-SYMBOL(<ls>).
      CLEAR <ls>-sub.
    ENDLOOP.`, expected: message("SUB")},
    {abap: `LOOP AT lt_secondary ASSIGNING FIELD-SYMBOL(<ls>) USING KEY by_val.
      <ls>-id = 2.
    ENDLOOP.`, expected: message("ID")},
    {abap: `LOOP AT lt_int ASSIGNING FIELD-SYMBOL(<lv>).
      <lv> = 2.
    ENDLOOP.`, expected: line},
    {abap: `LOOP AT lt_int ASSIGNING FIELD-SYMBOL(<lv>).
      CLEAR <lv>.
    ENDLOOP.`, expected: line},
    {abap: `LOOP AT lt_line ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-val = 2.
    ENDLOOP.`, expected: line},
    {abap: `LOOP AT lt_sorted REFERENCE INTO DATA(lr).
      lr->id = 2.
    ENDLOOP.`, expected: message("ID")},
    {abap: `READ TABLE lt_sorted REFERENCE INTO DATA(lr) WITH TABLE KEY id = 1.
    lr->*-id = 2.`, expected: message("ID")},
    {abap: `LOOP AT lt_sorted REFERENCE INTO lr_row.
      lr_row->id = 2.
    ENDLOOP.`, expected: message("ID")},
  ];

  for (const e of errors) {
    it("error: " + e.abap.replace(/\s+/g, " "), () => {
      expect(runMethod(e.abap)).to.deep.equal([e.expected]);
    });
  }

  const fine = [
    // non-key components
    `LOOP AT lt_sorted ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-val = 2.
      <ls>-name = 'A'.
      CLEAR <ls>-sub.
    ENDLOOP.`,
    `READ TABLE lt_sorted ASSIGNING FIELD-SYMBOL(<ls>) WITH TABLE KEY id = 1.
    <ls>-val = 2.`,
    `LOOP AT lt_sub ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-sub-b = 2.
    ENDLOOP.`,
    `LOOP AT lt_sorted REFERENCE INTO DATA(lr).
      lr->val = 2.
    ENDLOOP.`,
    // standard tables, also with a key or a sorted/hashed secondary key
    `LOOP AT lt_standard ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-id = 2.
    ENDLOOP.`,
    `LOOP AT lt_std_key ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-id = 2.
    ENDLOOP.`,
    `LOOP AT lt_std_secondary ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-id = 2.
    ENDLOOP.`,
    // component only in a secondary key
    `LOOP AT lt_secondary ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-val = 2.
    ENDLOOP.`,
    // generic tables
    `LOOP AT it_generic ASSIGNING <lv_any>.
      CLEAR <lv_any>.
    ENDLOOP.`,
    `LOOP AT it_sorted_generic ASSIGNING <lv_any>.
      CLEAR <lv_any>.
    ENDLOOP.`,
    // a structured DEFAULT KEY is not resolved
    `LOOP AT lt_default ASSIGNING FIELD-SYMBOL(<ls>).
      <ls>-id = 2.
    ENDLOOP.`,
    // the whole line of a table with a component key is not checked
    `LOOP AT lt_sorted ASSIGNING FIELD-SYMBOL(<ls>).
      <ls> = ls_row.
    ENDLOOP.`,
    // INTO a work area
    `LOOP AT lt_sorted INTO DATA(ls).
      ls-id = 2.
    ENDLOOP.`,
    // re-assigned
    `LOOP AT lt_sorted ASSIGNING <ls_row>.
      ASSIGN ls_row TO <ls_row>.
      <ls_row>-id = 2.
    ENDLOOP.`,
    `READ TABLE lt_sorted INDEX 1 ASSIGNING <ls_row>.
    UNASSIGN <ls_row>.
    ASSIGN ls_row TO <ls_row>.
    <ls_row>-id = 2.`,
    `READ TABLE lt_sorted INDEX 1 ASSIGNING <ls_row>.
    READ TABLE lt_standard INDEX 1 ASSIGNING <ls_row>.
    <ls_row>-id = 2.`,
    `LOOP AT lt_sorted REFERENCE INTO lr_row.
      lr_row = REF #( ls_row ).
      lr_row->id = 2.
    ENDLOOP.`,
    `LOOP AT lt_sorted REFERENCE INTO lr_row.
      GET REFERENCE OF ls_row INTO lr_row.
      lr_row->id = 2.
    ENDLOOP.`,
    // a declared field symbol after the LOOP
    `LOOP AT lt_sorted ASSIGNING <ls_row>.
    ENDLOOP.
    <ls_row>-id = 2.`,
    // CASTING
    `LOOP AT lt_sorted ASSIGNING <ls_row> CASTING.
      <ls_row>-id = 2.
    ENDLOOP.`,
    // APPEND/INSERT INITIAL LINE is a different topic
    `APPEND INITIAL LINE TO lt_standard ASSIGNING FIELD-SYMBOL(<ls>).
    <ls>-id = 2.`,
    `INSERT INITIAL LINE INTO TABLE lt_sorted ASSIGNING FIELD-SYMBOL(<ls>).
    <ls>-val = 2.`,
  ];

  for (const abap of fine) {
    it("fine: " + abap.replace(/\s+/g, " "), () => {
      expect(runMethod(abap)).to.deep.equal([]);
    });
  }

  it("program, FORM", () => {
    const abap = `
TYPES: BEGIN OF ty_row,
         id  TYPE i,
         val TYPE i,
       END OF ty_row.
DATA gt_sorted TYPE SORTED TABLE OF ty_row WITH UNIQUE KEY id.
FORM run.
  LOOP AT gt_sorted ASSIGNING FIELD-SYMBOL(<ls>).
    <ls>-id = 2.
    <ls>-val = 2.
  ENDLOOP.
ENDFORM.`;
    const issues = runMulti([{filename: "zsorted.prog.abap", contents: abap}]).map(i => i.getMessage());
    expect(issues).to.deep.equal([message("ID")]);
  });

});
