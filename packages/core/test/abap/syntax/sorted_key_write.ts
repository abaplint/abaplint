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
