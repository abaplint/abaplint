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
    {abap: `APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
    <lv> = 2.`, expected: line},
    {abap: `APPEND ls_row TO me->mt_sorted ASSIGNING <ls_row>.
    CLEAR <ls_row>-id.`, expected: message("ID")},
    {abap: `APPEND INITIAL LINE TO lt_sorted REFERENCE INTO DATA(lr).
    lr->id = 2.`, expected: message("ID")},
    {abap: `DATA component_name TYPE string VALUE 'VAL'.
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    ASSIGN lr_row->(component_name) TO <lv_any>.
    lr_row->id = 2.`, expected: message("ID")},
    {abap: `APPEND ls_row TO lt_sorted REFERENCE INTO lr_row.
    lr_row->id = 2.`, expected: message("ID")},
    {abap: `APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
    TRY.
      <lv> = 2.
    CATCH cx_root.
    ENDTRY.`, expected: line},
    {abap: `APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
    TRY.
      <lv> = 2.
    CATCH cx_root.
      TRY.
        RAISE EXCEPTION TYPE cx_sy_zerodivide.
      CATCH cx_sy_zerodivide.
        RETRY.
      ENDTRY.
    ENDTRY.`, expected: line},
    {abap: `APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
    DELETE lt_sorted INDEX 1.
    <lv> = 2.`, expected: line},
    {abap: `APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
    IF sy-uname = 'X'.
      CLEAR lt_int.
    ELSEIF sy-uname = 'Y'.
      <lv> = 2.
    ELSE.
      CLEAR lt_int.
    ENDIF.
    IF <lv> IS ASSIGNED.
      <lv> = 3.
    ENDIF.`, expected: line},
    {abap: `ASSIGN lt_sorted TO FIELD-SYMBOL(<table>).
    APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
    DELETE <table> INDEX 1.
    <lv> = 2.`, expected: line},
    {abap: `APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    MOVE-CORRESPONDING lt_standard TO lt_sorted KEEPING TARGET LINES.
    lr_row->id = 2.`, expected: message("ID")},
    {abap: `APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    MOVE-CORRESPONDING lt_sorted TO lt_sorted.
    lr_row->id = 2.`, expected: message("ID")},
    {abap: `FIELD-SYMBOLS <table> TYPE any.
    ASSIGN lt_sorted TO <table>.
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    MOVE-CORRESPONDING <table> TO lt_sorted.
    lr_row->id = 2.`, expected: message("ID")},
    {abap: `ASSIGN lt_sorted TO FIELD-SYMBOL(<table>).
    DO 1 TIMES.
      APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
      MOVE-CORRESPONDING <table> TO lt_sorted.
      lr_row->id = 2.
    ENDDO.`, expected: message("ID")},
    {abap: `DATA other TYPE ty_sorted.
    ASSIGN lt_sorted TO FIELD-SYMBOL(<table>).
    DO 2 TIMES.
      ls_row-id = sy-index.
      APPEND ls_row TO lt_sorted REFERENCE INTO lr_row.
      ASSIGN <table> TO FIELD-SYMBOL(<copy>).
      MOVE-CORRESPONDING <table> TO <copy>.
      lr_row->id = 3.
      ASSIGN other TO <table>.
    ENDDO.`, expected: message("ID")},
    {abap: `DATA other TYPE ty_sorted.
    FIELD-SYMBOLS: <table> TYPE ty_sorted, <copy> TYPE ty_sorted.
    IF sy-uname = 'X'.
      ASSIGN other TO <table>.
      ASSIGN <table> TO <copy>.
    ELSE.
      ASSIGN lt_sorted TO <table>.
      ASSIGN <table> TO <copy>.
    ENDIF.
    DO 2 TIMES.
      ls_row-id = sy-index.
      APPEND ls_row TO lt_sorted REFERENCE INTO lr_row.
      MOVE-CORRESPONDING <table> TO <copy>.
      lr_row->id = 3.
    ENDDO.`, expected: message("ID")},
    {abap: `DATA other TYPE ty_sorted.
    ASSIGN other TO FIELD-SYMBOL(<table>).
    DO 2 TIMES.
      ls_row-id = sy-index.
      APPEND ls_row TO lt_sorted REFERENCE INTO lr_row.
      ASSIGN other TO <table>.
      CLEAR <table>.
      lr_row->id = 3.
      ASSIGN lt_sorted TO <table>.
    ENDDO.`, expected: message("ID")},
    {abap: `DATA other TYPE ty_sorted.
    ASSIGN other TO FIELD-SYMBOL(<table>).
    DO 2 TIMES.
      ls_row-id = sy-index.
      APPEND ls_row TO lt_sorted REFERENCE INTO lr_row.
      CLEAR <table>.
      lr_row->id = 3.
      ASSIGN lt_sorted TO <table>.
      ASSIGN other TO <table>.
    ENDDO.`, expected: message("ID")},
    {abap: `DATA other TYPE ty_sorted.
    ASSIGN other TO FIELD-SYMBOL(<table>).
    DO 2 TIMES.
      ls_row-id = sy-index.
      APPEND ls_row TO lt_sorted REFERENCE INTO lr_row.
      CLEAR <table>.
      lr_row->id = 3.
      IF sy-uname = 'X'.
        ASSIGN lt_sorted TO <table>.
        EXIT.
      ENDIF.
    ENDDO.`, expected: message("ID")},
    {abap: `TYPES: BEGIN OF ty_note, note TYPE string, END OF ty_note.
    DATA notes TYPE STANDARD TABLE OF ty_note WITH EMPTY KEY.
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    MOVE-CORRESPONDING notes TO lt_sorted.
    lr_row->id = 2.`, expected: message("ID")},
    {abap: `DATA: BEGIN OF box, items TYPE ty_sorted, label TYPE i, END OF box.
    DATA: BEGIN OF partial, label TYPE i, END OF partial.
    APPEND INITIAL LINE TO box-items REFERENCE INTO lr_row.
    MOVE-CORRESPONDING partial TO box.
    lr_row->id = 2.`, expected: message("ID")},
    {abap: `DATA: BEGIN OF box, BEGIN OF inner, items TYPE ty_sorted, END OF inner, END OF box.
    DATA: BEGIN OF partial, BEGIN OF inner, label TYPE i, END OF inner, END OF partial.
    APPEND INITIAL LINE TO box-inner-items REFERENCE INTO lr_row.
    MOVE-CORRESPONDING partial TO box.
    lr_row->id = 2.`, expected: message("ID")},
    {abap: `TYPES: BEGIN OF ty_note, note TYPE string, END OF ty_note.
    TYPES ty_notes TYPE STANDARD TABLE OF ty_note WITH EMPTY KEY.
    DATA: BEGIN OF box, items TYPE ty_sorted, END OF box.
    DATA: BEGIN OF partial, items TYPE ty_notes, END OF partial.
    APPEND INITIAL LINE TO box-items REFERENCE INTO lr_row.
    MOVE-CORRESPONDING partial TO box EXPANDING NESTED TABLES.
    lr_row->id = 2.`, expected: message("ID")},
    {abap: `APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    CALL TRANSFORMATION id SOURCE tab = lt_sorted RESULT XML DATA(xml).
    lr_row->id = 2.`, expected: message("ID")},
    {abap: `APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    CALL TRANSFORMATION id SOURCE ref = lr_row RESULT XML DATA(xml).
    lr_row->id = 2.`, expected: message("ID")},
    {abap: `APPEND ls_row TO lt_sorted SORTED BY id ASSIGNING FIELD-SYMBOL(<ls>).
    <ls>-id = 2.`, expected: "APPEND SORTED BY requires a standard table"},
    {abap: `DO 1 TIMES.
      APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
      IF sy-index = 1.
        CLEAR <lv>.
      ENDIF.
    ENDDO.`, expected: line},
    {abap: `DO 1 TIMES.
      APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
      CLEAR lr_row->id.
    ENDDO.`, expected: message("ID")},
    {abap: `ASSIGN ls_row-val TO <lv_any>.
    APPEND ls_row TO lt_int ASSIGNING <lv_any>.
    <lv_any> = 2.`, expected: "Incompatible types"},
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
    `APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
    WRITE <lv>.`,
    `APPEND INITIAL LINE TO lt_sorted ASSIGNING FIELD-SYMBOL(<ls>).
    <ls>-val = 2.`,
    `APPEND INITIAL LINE TO lt_standard ASSIGNING FIELD-SYMBOL(<ls>).
    <ls>-id = 2.`,
    `APPEND INITIAL LINE TO lt_sorted ASSIGNING <ls_row>.
    APPEND INITIAL LINE TO lt_standard ASSIGNING <ls_row>.
    <ls_row>-id = 2.`,
    `APPEND INITIAL LINE TO lt_standard ASSIGNING <ls_row>.
    IF sy-subrc = 0.
      APPEND INITIAL LINE TO lt_sorted ASSIGNING <ls_row>.
    ELSE.
      <ls_row>-id = 2.
    ENDIF.`,
    `APPEND INITIAL LINE TO lt_sorted ASSIGNING <ls_row>.
    DO 2 TIMES.
      IF sy-index = 2.
        <ls_row>-id = 2.
      ENDIF.
      ASSIGN ls_row TO <ls_row>.
    ENDDO.`,
    `DATA numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY.
    numbers = VALUE #( ( 1 ) ( 2 ) ).
    APPEND INITIAL LINE TO lt_int ASSIGNING <lv_any>.
    WITH +cte AS ( SELECT FROM @numbers AS t FIELDS t~table_line )
      SELECT FROM +cte FIELDS table_line ORDER BY table_line INTO @DATA(current).
      IF current = 2.
        <lv_any> = 2.
      ENDIF.
      ASSIGN ls_row-val TO <lv_any>.
    ENDWITH.`,
    `TRY.
      APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
      RAISE RESUMABLE EXCEPTION TYPE cx_sy_zerodivide.
      lr_row->id = 2.
    CATCH BEFORE UNWIND cx_sy_zerodivide.
      CREATE DATA lr_row.
      RESUME.
    ENDTRY.`,
    `DATA retried TYPE abap_bool.
    APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
    TRY.
      IF retried = abap_false.
        RAISE EXCEPTION TYPE cx_sy_zerodivide.
      ENDIF.
      <lv> = 2.
    CATCH cx_sy_zerodivide.
      retried = abap_true.
      ASSIGN ls_row-val TO <lv>.
      RETRY.
    ENDTRY.`,
    `DATA xml TYPE xstring.
    CREATE DATA lr_row.
    CALL TRANSFORMATION id SOURCE ref = lr_row RESULT XML xml.
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    CALL TRANSFORMATION id SOURCE XML xml RESULT ref = lr_row.
    lr_row->id = 2.`,
    `APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
    TRY.
      DELETE lt_int INDEX 1.
      IF <lv> IS ASSIGNED.
        <lv> = 2.
      ENDIF.
    CATCH cx_root.
    ENDTRY.`,
    `APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    CLEAR lt_sorted[].
    IF lr_row IS BOUND.
      lr_row->id = 2.
    ENDIF.`,
    `APPEND INITIAL LINE TO me->mt_sorted REFERENCE INTO lr_row.
    DELETE mt_sorted INDEX 1.
    IF lr_row IS BOUND.
      lr_row->id = 2.
    ENDIF.`,
    `ASSIGN lt_int TO FIELD-SYMBOL(<table>).
    APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
    TRY.
      DELETE <table> INDEX 1.
      IF <lv> IS ASSIGNED.
        <lv> = 2.
      ENDIF.
    CATCH cx_root.
    ENDTRY.`,
    `DATA other TYPE ty_sorted.
    ASSIGN lt_sorted TO FIELD-SYMBOL(<table>).
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    LOOP AT other INTO DATA(ignored).
      ASSIGN other TO <table>.
    ENDLOOP.
    CLEAR <table>.
    IF lr_row IS BOUND.
      lr_row->id = 2.
    ENDIF.`,
    `DATA other TYPE ty_sorted.
    ASSIGN other TO FIELD-SYMBOL(<table>).
    DO 2 TIMES.
      ls_row-id = sy-index.
      APPEND ls_row TO lt_sorted REFERENCE INTO lr_row.
      ASSIGN <table> TO FIELD-SYMBOL(<copy>).
      CLEAR <copy>.
      IF sy-index = 2 AND lr_row IS BOUND.
        lr_row->id = 3.
      ENDIF.
      ASSIGN lt_sorted TO <table>.
    ENDDO.`,
    `DATA other TYPE ty_sorted.
    ASSIGN other TO FIELD-SYMBOL(<table>).
    DO 2 TIMES.
      ls_row-id = sy-index.
      APPEND ls_row TO <table> REFERENCE INTO lr_row.
      CLEAR lt_sorted.
      IF sy-index = 2 AND lr_row IS BOUND.
        lr_row->id = 3.
      ENDIF.
      ASSIGN lt_sorted TO <table>.
    ENDDO.`,
    `DATA other TYPE ty_sorted.
    ASSIGN other TO FIELD-SYMBOL(<table>).
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    TRY.
      ASSIGN lt_sorted TO <table>.
      RAISE EXCEPTION TYPE cx_sy_zerodivide.
      ASSIGN other TO <table>.
    CATCH cx_sy_zerodivide.
      CLEAR <table>.
      IF lr_row IS BOUND.
        lr_row->id = 2.
      ENDIF.
    ENDTRY.`,
    `DATA missing TYPE REF TO ty_sorted.
    ASSIGN lt_sorted TO FIELD-SYMBOL(<table>).
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    ASSIGN missing->* TO <table>.
    IF sy-subrc <> 0.
      CLEAR <table>.
      IF lr_row IS BOUND.
        lr_row->id = 2.
      ENDIF.
    ENDIF.`,
    `DATA table_ref TYPE REF TO ty_sorted.
    GET REFERENCE OF lt_sorted INTO table_ref.
    DATA(table_ref_copy) = table_ref.
    ASSIGN table_ref_copy->* TO FIELD-SYMBOL(<table>).
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    CLEAR <table>.
    IF lr_row IS BOUND.
      lr_row->id = 2.
    ENDIF.`,
    `FIELD-SYMBOLS <table> TYPE any.
    DATA table_ref TYPE REF TO data.
    ASSIGN lt_sorted TO <table>.
    table_ref = REF data( <table> ).
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    CLEAR table_ref->*.
    IF lr_row IS BOUND.
      lr_row->id = 2.
    ENDIF.`,
    `DATA other TYPE ty_sorted.
    FIELD-SYMBOLS <table> LIKE lt_sorted.
    IF sy-uname = 'X'.
      ASSIGN lt_sorted TO <table>.
    ELSE.
      ASSIGN other TO <table>.
    ENDIF.
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    CLEAR <table>.
    IF lr_row IS BOUND.
      lr_row->id = 2.
    ENDIF.`,
    `APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    TRY.
      MOVE-CORRESPONDING lt_standard TO lt_sorted.
      IF lr_row IS BOUND.
        lr_row->id = 2.
      ENDIF.
    CATCH cx_root.
    ENDTRY.`,
    `DATA: BEGIN OF box, items TYPE ty_sorted, END OF box.
    DATA empty_box LIKE box.
    APPEND INITIAL LINE TO box-items REFERENCE INTO lr_row.
    MOVE-CORRESPONDING empty_box TO box.
    IF lr_row IS BOUND.
      lr_row->id = 2.
    ENDIF.`,
    `CALL TRANSFORMATION id SOURCE tab = lt_std_key RESULT XML DATA(xml).
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    TRY.
      CALL TRANSFORMATION id SOURCE XML xml RESULT tab = lt_sorted.
      IF lr_row IS BOUND.
        lr_row->id = 2.
      ENDIF.
    CATCH cx_root.
    ENDTRY.`,
    `DATA other TYPE STANDARD TABLE OF i WITH EMPTY KEY.
    APPEND INITIAL LINE TO lt_int ASSIGNING FIELD-SYMBOL(<lv>).
    SELECT FROM @other AS other FIELDS table_line INTO TABLE @lt_int.
    IF <lv> IS ASSIGNED.
      <lv> = 2.
    ENDIF.`,
    `APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    ASSIGN lr_row TO FIELD-SYMBOL(<ref>).
    <ref> = REF #( ls_row ).
    lr_row->id = 2.`,
    `DATA component TYPE REF TO ty_row.
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO component.
    ASSIGN component TO FIELD-SYMBOL(<ref>).
    <ref> = REF #( ls_row ).
    component->id = 2.`,
    `DATA offset TYPE i.
    FIELD-SYMBOLS <ref> LIKE lr_row.
    ASSIGN lr_row INCREMENT offset TO <ref>.
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    <ref> = REF #( ls_row ).
    lr_row->id = 2.`,
    `DATA(address) = REF #( lr_row ).
    APPEND INITIAL LINE TO lt_sorted REFERENCE INTO lr_row.
    address->* = REF #( ls_row ).
    lr_row->id = 2.`,
    `DATA row_ref TYPE REF TO data.
    DATA spare_ref TYPE REF TO data.
    APPEND 1 TO lt_int REFERENCE INTO row_ref.
    row_ref->* = row_ref = REF data( spare_ref ).`,
    `DATA missing TYPE cl_external_api=>ty_ref.
    DATA copy TYPE REF TO i.
    GET REFERENCE OF ls_row-val INTO copy.
    ASSIGN missing TO FIELD-SYMBOL(<alias>).
    APPEND INITIAL LINE TO lt_int REFERENCE INTO missing.
    <alias> = copy.
    missing->* = 2.`,
    `TYPES ty_ref TYPE REF TO i.
    DATA lr TYPE ty_ref.
    DATA address TYPE REF TO ty_ref.
    DO 2 TIMES.
      APPEND sy-index TO lt_int REFERENCE INTO lr.
      IF sy-index = 2.
        address->* = REF #( ls_row-val ).
        lr->* = 2.
      ENDIF.
      GET REFERENCE OF lr INTO address.
    ENDDO.`,
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

  it("program, clearing the header leaves the appended row bound", () => {
    const abap = `FORM run.
  DATA tab TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line WITH HEADER LINE.
  APPEND INITIAL LINE TO tab REFERENCE INTO DATA(lr).
  CLEAR tab.
  lr->* = 2.
ENDFORM.`;
    const issues = runMulti([{filename: "zsorted.prog.abap", contents: abap}]);
    expect(issues.map(i => i.getMessage())).to.deep.equal([line]);
  });

  it("function group, APPEND distinguishes global and local VALUE parameters", () => {
    const exportRef = "<EXPORT><RSEXP><PARAMETER>LR</PARAMETER><TYP>ZCL_TYPES=&gt;TY_REF</TYP></RSEXP></EXPORT>";
    const xml = `<abapGit><asx:abap xmlns:asx="http://www.sap.com/abapxml"><asx:values>
      <INCLUDES><SOBJ_NAME>SAPLZREVIEW</SOBJ_NAME></INCLUDES>
      <FUNCTIONS>
        <item><FUNCNAME>ZREVIEW_ADD</FUNCNAME><GLOBAL_FLAG>X</GLOBAL_FLAG>${exportRef}</item>
        <item><FUNCNAME>ZREVIEW_CREATE</FUNCNAME></item>
        <item><FUNCNAME>ZREVIEW_LOCAL</FUNCNAME>${exportRef}</item>
      </FUNCTIONS>
    </asx:values></asx:abap></abapGit>`;
    const append = `  DATA tab TYPE SORTED TABLE OF i WITH UNIQUE DEFAULT KEY.
  APPEND INITIAL LINE TO tab REFERENCE INTO lr.`;
    const issues = runMulti([
      {filename: "zcl_types.clas.abap", contents: `CLASS zcl_types DEFINITION PUBLIC.
  PUBLIC SECTION.
    TYPES ty_ref TYPE REF TO i.
ENDCLASS.
CLASS zcl_types IMPLEMENTATION.
ENDCLASS.`},
      {filename: "zreview.fugr.xml", contents: xml},
      {filename: "zreview.fugr.saplzreview.abap", contents: "FUNCTION-POOL zreview."},
      {filename: "zreview.fugr.zreview_add.abap", contents: `FUNCTION zreview_add.
${append}
  CALL FUNCTION 'ZREVIEW_CREATE'.
  lr->* = 2.
ENDFUNCTION.`},
      {filename: "zreview.fugr.zreview_create.abap", contents: `FUNCTION zreview_create.
  CREATE DATA lr.
ENDFUNCTION.`},
      {filename: "zreview.fugr.zreview_local.abap", contents: `FUNCTION zreview_local.
${append}
  lr->* = 2.
ENDFUNCTION.`},
    ]);
    expect(issues.map(i => [i.getFilename(), i.getMessage()])).to.deep.equal([["zreview.fugr.zreview_local.abap", line]]);
  });

  it("program, APPEND aliases can be rebound by legacy FORM statements", () => {
    const abap = `
TYPES ty_ref TYPE REF TO i.
DATA gv_value TYPE i.
DATA address TYPE REF TO ty_ref.
FORM run.
  DATA tab TYPE SORTED TABLE OF i WITH UNIQUE DEFAULT KEY.
  FIELD-SYMBOLS <fs> TYPE i.
  DATA lr TYPE ty_ref.
  DATA lr2 TYPE ty_ref.
  APPEND INITIAL LINE TO tab ASSIGNING <fs>.
  ASSIGN LOCAL COPY OF gv_value TO <fs>.
  <fs> = 2.
  APPEND 1 TO tab REFERENCE INTO lr.
  PERFORM set_ref USING lr.
  lr->* = 2.
  PERFORM remember CHANGING lr2.
  APPEND 2 TO tab REFERENCE INTO lr2.
  address->* = REF #( gv_value ).
  lr2->* = 3.
ENDFORM.
FORM set_ref USING lr TYPE ty_ref.
  CREATE DATA lr.
ENDFORM.
FORM remember CHANGING lr TYPE ty_ref.
  GET REFERENCE OF lr INTO address.
ENDFORM.`;
    expect(runMulti([{filename: "zsorted.prog.abap", contents: abap}])).to.deep.equal([]);
  });

  it("program, PERFORM uses the formal parameter's pass mode", () => {
    const abap = `TYPES ty_ref TYPE REF TO i.
FORM run.
  DATA tab TYPE SORTED TABLE OF i WITH UNIQUE DEFAULT KEY.
  DATA lr TYPE ty_ref.
  APPEND 1 TO tab.
  READ TABLE tab INDEX 1 REFERENCE INTO lr.
  PERFORM copy_ref USING lr.
  lr->* = 2.
  APPEND 2 TO tab REFERENCE INTO lr.
  PERFORM copy_ref CHANGING lr.
  lr->* = 3.
  PERFORM copy_back USING lr.
  lr->* = 4.
  APPEND 3 TO tab REFERENCE INTO lr.
  lr->* = 5.
ENDFORM.
FORM copy_ref USING VALUE(local_ref) TYPE ty_ref.
  CREATE DATA local_ref.
ENDFORM.
FORM copy_back CHANGING VALUE(local_ref) TYPE ty_ref.
  CREATE DATA local_ref.
ENDFORM.`;
    const issues = runMulti([{filename: "zsorted.prog.abap", contents: abap}]);
    expect(issues.map(i => i.getStart().getRow())).to.deep.equal([8, 11, 15]);
  });

  it("program, a writable table argument can remove the appended row", () => {
    const abap = `TYPES ty_tab TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line.
FORM run.
  DATA tab TYPE ty_tab.
  APPEND INITIAL LINE TO tab REFERENCE INTO DATA(lr).
  PERFORM wipe CHANGING tab.
  IF lr IS BOUND.
    lr->* = 2.
  ENDIF.
  APPEND 2 TO tab REFERENCE INTO lr.
  PERFORM copy USING tab.
  lr->* = 3.
ENDFORM.
FORM wipe CHANGING rows TYPE ty_tab.
  CLEAR rows.
ENDFORM.
FORM copy USING VALUE(rows) TYPE ty_tab.
  CLEAR rows.
ENDFORM.`;
    const issues = runMulti([{filename: "zsorted.prog.abap", contents: abap}]);
    expect(issues.map(i => [i.getStart().getRow(), i.getMessage()])).to.deep.equal([[11, line]]);
  });

  it("program, a routine can remove an appended row from a shared table without an argument", () => {
    const abap = `TYPES ty_tab TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line.
DATA shared TYPE ty_tab.
DATA external_ref TYPE REF TO ty_tab.
FORM run.
  DATA local TYPE ty_tab.
  DATA exposed TYPE ty_tab.
  GET REFERENCE OF exposed INTO external_ref.
  APPEND INITIAL LINE TO shared REFERENCE INTO DATA(shared_row).
  APPEND INITIAL LINE TO local REFERENCE INTO DATA(local_row).
  APPEND INITIAL LINE TO exposed REFERENCE INTO DATA(exposed_row).
  PERFORM wipe.
  IF shared_row IS BOUND.
    shared_row->* = 1.
  ENDIF.
  IF exposed_row IS BOUND.
    exposed_row->* = 1.
  ENDIF.
  local_row->* = 1.
ENDFORM.
FORM wipe.
  CLEAR shared.
  CLEAR external_ref->*.
ENDFORM.`;
    const issues = runMulti([{filename: "zsorted.prog.abap", contents: abap}]);
    const write = abap.split("\n").findIndex(row => row.includes("local_row->* = 1.")) + 1;
    expect(issues.map(i => [i.getStart().getRow(), i.getMessage()])).to.deep.equal([[write, line]]);
  });

  it("program, only execution of a scheduled routine can remove the appended row", () => {
    const abap = `DATA shared TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line.
FORM run.
  APPEND INITIAL LINE TO shared REFERENCE INTO DATA(row_ref).
  PERFORM wipe ON COMMIT.
  row_ref->* = 1.
  COMMIT WORK.
  IF row_ref IS BOUND.
    row_ref->* = 2.
  ENDIF.
ENDFORM.
FORM wipe.
  CLEAR shared.
ENDFORM.`;
    const issues = runMulti([{filename: "zsorted.prog.abap", contents: abap}]);
    expect(issues.map(i => [i.getStart().getRow(), i.getMessage()])).to.deep.equal([[5, line]]);
  });

  it("program, a possibly empty loop can leave a scheduled routine pending", () => {
    const abap = `DATA shared TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line.
FORM run.
  DATA empty TYPE STANDARD TABLE OF i WITH EMPTY KEY.
  PERFORM wipe ON COMMIT.
  LOOP AT empty INTO DATA(dummy).
    ROLLBACK WORK.
  ENDLOOP.
  APPEND INITIAL LINE TO shared REFERENCE INTO DATA(row_ref).
  COMMIT WORK.
  IF row_ref IS BOUND.
    row_ref->* = 1.
  ENDIF.
ENDFORM.
FORM wipe.
  CLEAR shared.
ENDFORM.`;
    const issues = (contents: string) => runMulti([{filename: "zsorted.prog.abap", contents}]);
    expect(issues(abap)).to.have.length(0);
    const once = abap.replace("LOOP AT empty INTO DATA(dummy).", "DO 1 TIMES.").replace("ENDLOOP.", "ENDDO.");
    expect(issues(once).map(i => [i.getStart().getRow(), i.getMessage()])).to.deep.equal([[11, line]]);
  });

  it("program, a single iteration loses alias certainty after a dynamic ASSIGN", () => {
    const abap = `TYPES: BEGIN OF ty_row, id TYPE i, END OF ty_row.
TYPES ty_tab TYPE SORTED TABLE OF ty_row WITH UNIQUE KEY id.
FORM run.
  DATA tab TYPE ty_tab.
  DATA other TYPE ty_tab.
  DATA(ref1) = REF #( tab ).
  DATA(ref2) = ref1.
  DO 1 TIMES.
    APPEND INITIAL LINE TO tab ASSIGNING FIELD-SYMBOL(<row>).
    ASSIGN ('REF1') TO FIELD-SYMBOL(<opaque>).
    <opaque> = REF ty_tab( other ).
    MOVE-CORRESPONDING ref1->* TO ref2->*.
    IF <row> IS ASSIGNED.
      <row>-id = 1.
    ENDIF.
  ENDDO.
ENDFORM.`;
    expect(runMulti([{filename: "zsorted.prog.abap", contents: abap}])).to.have.length(0);
  });

  it("program, an unrelated call preserves the binding on a locally constructed object", () => {
    const abap = `CLASS lcl_owner DEFINITION.
  PUBLIC SECTION.
    DATA tab TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line.
ENDCLASS.
CLASS lcl_owner IMPLEMENTATION.
ENDCLASS.
FORM run.
  DATA owner TYPE REF TO lcl_owner.
  CREATE OBJECT owner.
  APPEND INITIAL LINE TO owner->tab REFERENCE INTO DATA(row_ref).
  PERFORM unrelated.
  row_ref->* = 1.
ENDFORM.
FORM unrelated.
ENDFORM.`;
    const issues = runMulti([{filename: "zsorted.prog.abap", contents: abap}]);
    expect(issues.map(i => [i.getStart().getRow(), i.getMessage()])).to.deep.equal([[12, line]]);
  });

  it("program, inherited static tables resolve to the same declaration under either qualifier", () => {
    const abap = `CLASS lcl_parent DEFINITION.
  PUBLIC SECTION.
    TYPES ty_tab TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line.
    CLASS-DATA tab TYPE ty_tab.
ENDCLASS.
CLASS lcl_parent IMPLEMENTATION.
ENDCLASS.
CLASS lcl_child DEFINITION INHERITING FROM lcl_parent.
  PUBLIC SECTION.
    CLASS-METHODS run.
ENDCLASS.
CLASS lcl_child IMPLEMENTATION.
  METHOD run.
    APPEND INITIAL LINE TO tab REFERENCE INTO DATA(first).
    CLEAR lcl_parent=>tab.
    IF first IS BOUND.
      first->* = 1.
    ENDIF.
    APPEND 2 TO lcl_child=>tab REFERENCE INTO DATA(second).
    CLEAR tab.
    IF second IS BOUND.
      second->* = 2.
    ENDIF.
    APPEND 3 TO lcl_parent=>tab REFERENCE INTO DATA(third).
    third->* = 3.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runMulti([{filename: "zsorted.prog.abap", contents: abap}]);
    const write = abap.split("\n").findIndex(row => row.includes("third->* = 3.")) + 1;
    expect(issues.map(i => [i.getStart().getRow(), i.getMessage()])).to.deep.equal([[write, line]]);
  });

  it("program, an interface alias resolves to the implementing class's static table", () => {
    const abap = `INTERFACE lif_tables.
  TYPES ty_tab TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line.
  CLASS-DATA tab TYPE ty_tab.
ENDINTERFACE.
CLASS lcl_one DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_tables.
    ALIASES alias_tab FOR lif_tables~tab.
ENDCLASS.
CLASS lcl_other DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_tables.
ENDCLASS.
FORM run.
  APPEND INITIAL LINE TO lcl_one=>alias_tab REFERENCE INTO DATA(row_ref).
  CLEAR lcl_other=>lif_tables~tab.
  IF sy-uname = 'X'.
    row_ref->* = 1.
  ENDIF.
  CLEAR lcl_one=>lif_tables~tab.
  IF row_ref IS BOUND.
    row_ref->* = 2.
  ENDIF.
ENDFORM.`;
    const issues = runMulti([{filename: "zsorted.prog.abap", contents: abap}]);
    expect(issues.map(i => [i.getStart().getRow(), i.getMessage()])).to.deep.equal([[18, line]]);
  });

  it("method calls can remove rows through writable arguments and data references", () => {
    const abap = `CLASS zcl_sorted DEFINITION PUBLIC.
  PUBLIC SECTION.
    TYPES ty_tab TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line.
    METHODS run.
    METHODS wipe CHANGING rows TYPE ty_tab.
    METHODS wipe_ref IMPORTING rows TYPE REF TO ty_tab.
    METHODS observe IMPORTING rows TYPE ty_tab.
    METHODS reset EXPORTING VALUE(out) TYPE REF TO ty_tab.
ENDCLASS.
CLASS zcl_sorted IMPLEMENTATION.
  METHOD wipe.
    CLEAR rows.
  ENDMETHOD.
  METHOD wipe_ref.
    CLEAR rows->*.
  ENDMETHOD.
  METHOD observe.
  ENDMETHOD.
  METHOD reset.
    CLEAR out.
  ENDMETHOD.
  METHOD run.
    DATA tab TYPE ty_tab.
    APPEND INITIAL LINE TO tab REFERENCE INTO DATA(lr).
    wipe( CHANGING rows = tab ).
    IF lr IS BOUND.
      lr->* = 1.
    ENDIF.
    APPEND 2 TO tab REFERENCE INTO lr.
    wipe_ref( ( REF #( tab ) ) ).
    IF lr IS BOUND.
      lr->* = 2.
    ENDIF.
    APPEND 3 TO tab REFERENCE INTO lr.
    observe( tab ).
    DATA(ptr) = REF #( tab ).
    reset( IMPORTING out = ptr ).
    lr->* = 3.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runMulti([{filename: "zcl_sorted.clas.abap", contents: abap}]);
    const write = abap.split("\n").findIndex(row => row.includes("lr->* = 3.")) + 1;
    expect(issues.map(i => [i.getStart().getRow(), i.getMessage()])).to.deep.equal([[write, line]]);
  });

  it("program, ASSIGN LOCAL COPY in IF preserves the READ diagnostic in ELSE", () => {
    const abap = `DATA gv TYPE i.
FORM run.
  DATA tab TYPE SORTED TABLE OF i WITH UNIQUE DEFAULT KEY.
  FIELD-SYMBOLS <fs> TYPE i.
  APPEND 1 TO tab.
  READ TABLE tab INDEX 1 ASSIGNING <fs>.
  IF sy-subrc = 0.
    IF sy-uname = 'A'.
      ASSIGN LOCAL COPY OF gv TO <fs>.
    ELSE.
      <fs> = 2.
    ENDIF.
  ENDIF.
ENDFORM.`;
    const issues = runMulti([{filename: "zsorted.prog.abap", contents: abap}]);
    expect(issues.map(i => i.getMessage())).to.deep.equal([line]);
  });

  it("program, APPEND inside an INCLUDE uses the surrounding IF block", () => {
    const abap = `FORM run.
  DATA sorted TYPE SORTED TABLE OF i WITH UNIQUE DEFAULT KEY.
  DATA standard TYPE STANDARD TABLE OF i WITH EMPTY KEY.
  FIELD-SYMBOLS <fs> TYPE i.
  APPEND INITIAL LINE TO standard ASSIGNING <fs>.
  IF sy-uname = 'A'.
    INCLUDE zsorted_include.
    <fs> = 1.
  ELSE.
    <fs> = 2.
  ENDIF.
ENDFORM.`;
    const issues = runMulti([
      {filename: "zsorted.prog.abap", contents: abap},
      {filename: "zsorted_include.prog.abap", contents: "APPEND INITIAL LINE TO sorted ASSIGNING <fs>."},
      {filename: "zsorted_include.prog.xml", contents: "<SUBC>I</SUBC>"},
    ]);
    expect(issues.map(i => [i.getStart().getRow(), i.getMessage()])).to.deep.equal([[8, line]]);
  });

  it("method, a reference declared inline as an output can already have an alias", () => {
    const abap = `CLASS zcl_sorted DEFINITION PUBLIC.
  PUBLIC SECTION.
    TYPES ty_ref TYPE REF TO i.
    DATA address TYPE REF TO ty_ref.
    METHODS capture EXPORTING result TYPE ty_ref.
    METHODS run.
ENDCLASS.
CLASS zcl_sorted IMPLEMENTATION.
  METHOD capture.
    GET REFERENCE OF result INTO address.
  ENDMETHOD.
  METHOD run.
    DATA tab TYPE SORTED TABLE OF i WITH UNIQUE DEFAULT KEY.
    DATA spare TYPE i.
    capture( IMPORTING result = DATA(lr) ).
    APPEND INITIAL LINE TO tab REFERENCE INTO lr.
    address->* = REF #( spare ).
    lr->* = 2.
  ENDMETHOD.
ENDCLASS.`;
    expect(runMulti([{filename: "zcl_sorted.clas.abap", contents: abap}])).to.deep.equal([]);
  });

});
