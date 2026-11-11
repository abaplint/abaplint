import {expect} from "chai";
import {runMulti} from "./syntax";

function runMethod(body: string): string[] {
  const abap = `
CLASS zcl_secondary DEFINITION PUBLIC.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_row,
             id   TYPE i,
             name TYPE string,
             flag TYPE abap_bool,
             val  TYPE i,
           END OF ty_row.
    METHODS run.
ENDCLASS.

CLASS zcl_secondary IMPLEMENTATION.
  METHOD run.
    DATA lt TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY
      WITH NON-UNIQUE SORTED KEY by_name COMPONENTS name val
      WITH UNIQUE HASHED KEY by_id COMPONENTS id.
    DATA lt_int TYPE STANDARD TABLE OF i WITH DEFAULT KEY
      WITH NON-UNIQUE SORTED KEY by_line COMPONENTS table_line.
    DATA ls TYPE ty_row.
    DATA lv TYPE i.
${body}
  ENDMETHOD.
ENDCLASS.`;
  return runMulti([{filename: "zcl_secondary.clas.abap", contents: abap}]).map(i => i.getMessage());
}

const message = (key: string, component: string) =>
  `Loop, WHERE cannot be optimized for secondary key ${key}, ` +
  `key component ${component} needs a comparison with = or IS INITIAL joined by AND`;

describe("syntax, LOOP USING KEY sorted secondary key, WHERE must compare the first key component", () => {

  const errors: {abap: string, expected: string}[] = [
    {abap: `LOOP AT lt INTO ls USING KEY by_name WHERE ( name = 'A' OR name = 'B' ) AND flag = abap_true.
    ENDLOOP.`, expected: message("BY_NAME", "NAME")},
    {abap: `LOOP AT lt INTO ls USING KEY by_name WHERE name CP 'A*'.
    ENDLOOP.`, expected: message("BY_NAME", "NAME")},
    {abap: `LOOP AT lt INTO ls USING KEY by_name WHERE NOT name = 'A'.
    ENDLOOP.`, expected: message("BY_NAME", "NAME")},
    {abap: `LOOP AT lt INTO ls USING KEY by_name WHERE name IS NOT INITIAL.
    ENDLOOP.`, expected: message("BY_NAME", "NAME")},
    {abap: `LOOP AT lt INTO ls USING KEY by_name WHERE NOT ( name = 'A' AND flag = abap_true ).
    ENDLOOP.`, expected: message("BY_NAME", "NAME")},
    {abap: `LOOP AT lt INTO ls USING KEY by_name WHERE name <> 'A'.
    ENDLOOP.`, expected: message("BY_NAME", "NAME")},
    {abap: `LOOP AT lt INTO ls USING KEY by_name WHERE val = 1.
    ENDLOOP.`, expected: message("BY_NAME", "NAME")},
    {abap: `LOOP AT lt INTO ls USING KEY by_name WHERE flag = abap_true.
    ENDLOOP.`, expected: message("BY_NAME", "NAME")},
    {abap: `LOOP AT lt ASSIGNING FIELD-SYMBOL(<ls>) USING KEY by_name
      WHERE flag = abap_true AND ( val = 1 AND ( name = 'A' OR name = 'B' ) ).
    ENDLOOP.`, expected: message("BY_NAME", "NAME")},
    {abap: `LOOP AT lt_int INTO lv USING KEY by_line WHERE table_line > 2.
    ENDLOOP.`, expected: message("BY_LINE", "TABLE_LINE")},
  ];

  for (const e of errors) {
    it("error: " + e.abap.replace(/\s+/g, " "), () => {
      expect(runMethod(e.abap)).to.deep.equal([e.expected]);
    });
  }

  const fine = [
    `LOOP AT lt INTO ls USING KEY by_name WHERE name = 'A'.
    ENDLOOP.`,
    `LOOP AT lt INTO ls USING KEY by_name WHERE name EQ 'A' AND flag = abap_true.
    ENDLOOP.`,
    `LOOP AT lt INTO ls USING KEY by_name WHERE flag = abap_true AND name IS INITIAL.
    ENDLOOP.`,
    `LOOP AT lt INTO ls USING KEY by_name WHERE flag = abap_true AND ( val = 1 AND name = 'A' ).
    ENDLOOP.`,
    // a key component also under OR, besides the top-level comparison
    `LOOP AT lt INTO ls USING KEY by_name WHERE name = 'A' AND ( val = 1 OR flag = abap_true ).
    ENDLOOP.`,
    // only the first component is needed for a sorted key
    `LOOP AT lt INTO ls USING KEY by_name WHERE name = 'A' AND val > 2.
    ENDLOOP.`,
    `LOOP AT lt_int INTO lv USING KEY by_line WHERE table_line = 2.
    ENDLOOP.`,
    // hashed secondary key, a different rule
    `LOOP AT lt INTO ls USING KEY by_id WHERE id > 2.
    ENDLOOP.`,
    // primary key, no key, dynamic key, dynamic WHERE
    `LOOP AT lt INTO ls USING KEY primary_key WHERE name CP 'A*'.
    ENDLOOP.`,
    `LOOP AT lt INTO ls WHERE name CP 'A*'.
    ENDLOOP.`,
    `DATA(lv_key) = |BY_NAME|.
    LOOP AT lt INTO ls USING KEY (lv_key) WHERE name CP 'A*'.
    ENDLOOP.`,
    `DATA(lv_where) = |NAME CP 'A*'|.
    LOOP AT lt INTO ls USING KEY by_name WHERE (lv_where).
    ENDLOOP.`,
    `LOOP AT lt INTO ls USING KEY by_name.
    ENDLOOP.`,
  ];

  for (const f of fine) {
    it("fine: " + f.replace(/\s+/g, " "), () => {
      expect(runMethod(f)).to.deep.equal([]);
    });
  }

});
