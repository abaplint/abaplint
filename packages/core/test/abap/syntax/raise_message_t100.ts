import {expect} from "chai";
import {runMulti} from "./syntax";

function runProgram(body: string): string[] {
  const abap = `
CLASS cx_root DEFINITION ABSTRACT.
ENDCLASS.
CLASS cx_root IMPLEMENTATION.
ENDCLASS.
CLASS cx_static_check DEFINITION INHERITING FROM cx_root ABSTRACT.
ENDCLASS.
CLASS cx_static_check IMPLEMENTATION.
ENDCLASS.
CLASS cx_dynamic_check DEFINITION INHERITING FROM cx_root ABSTRACT.
ENDCLASS.
CLASS cx_dynamic_check IMPLEMENTATION.
ENDCLASS.
CLASS cx_no_check DEFINITION INHERITING FROM cx_root ABSTRACT.
ENDCLASS.
CLASS cx_no_check IMPLEMENTATION.
ENDCLASS.

INTERFACE lif_other.
ENDINTERFACE.

INTERFACE lif_msg.
  INTERFACES if_t100_message.
ENDINTERFACE.

CLASS lcx_plain DEFINITION INHERITING FROM cx_static_check.
ENDCLASS.
CLASS lcx_plain IMPLEMENTATION.
ENDCLASS.

CLASS lcx_plain_sub DEFINITION INHERITING FROM lcx_plain.
ENDCLASS.
CLASS lcx_plain_sub IMPLEMENTATION.
ENDCLASS.

CLASS lcx_other DEFINITION INHERITING FROM cx_dynamic_check.
  PUBLIC SECTION.
    INTERFACES lif_other.
ENDCLASS.
CLASS lcx_other IMPLEMENTATION.
ENDCLASS.

CLASS lcx_t100 DEFINITION INHERITING FROM cx_static_check.
  PUBLIC SECTION.
    INTERFACES if_t100_message.
ENDCLASS.
CLASS lcx_t100 IMPLEMENTATION.
ENDCLASS.

CLASS lcx_t100_sub DEFINITION INHERITING FROM lcx_t100.
ENDCLASS.
CLASS lcx_t100_sub IMPLEMENTATION.
ENDCLASS.

CLASS lcx_dyn DEFINITION INHERITING FROM cx_no_check.
  PUBLIC SECTION.
    INTERFACES if_t100_dyn_msg.
ENDCLASS.
CLASS lcx_dyn IMPLEMENTATION.
ENDCLASS.

CLASS lcx_nested DEFINITION INHERITING FROM cx_static_check.
  PUBLIC SECTION.
    INTERFACES lif_msg.
ENDCLASS.
CLASS lcx_nested IMPLEMENTATION.
ENDCLASS.

CLASS lcx_void_interface DEFINITION INHERITING FROM cx_static_check.
  PUBLIC SECTION.
    INTERFACES if_some_void.
ENDCLASS.
CLASS lcx_void_interface IMPLEMENTATION.
ENDCLASS.

START-OF-SELECTION.
${body}`;
  return runMulti([{filename: "zraise_message.prog.abap", contents: abap}]).map(i => i.getMessage());
}

const message = (name: string) => `Exception class ${name} must implement IF_T100_MESSAGE or IF_T100_DYN_MSG to be raised with MESSAGE`;
const textid = "RAISE EXCEPTION with MESSAGE, TEXTID cannot be passed";

describe("syntax, RAISE EXCEPTION or THROW with MESSAGE requires a T100 exception class", () => {

  const errors: {abap: string, expected: string}[] = [
    {abap: `RAISE EXCEPTION TYPE lcx_plain MESSAGE e001(zmsg).`, expected: message("LCX_PLAIN")},
    {abap: `RAISE EXCEPTION TYPE lcx_plain MESSAGE e001(zmsg) WITH 'a' 'b'.`, expected: message("LCX_PLAIN")},
    {abap: `RAISE EXCEPTION TYPE lcx_plain MESSAGE ID 'ZMSG' TYPE 'E' NUMBER '001'.`, expected: message("LCX_PLAIN")},
    {abap: `RAISE EXCEPTION TYPE lcx_plain MESSAGE ID 'ZMSG' NUMBER 001.`, expected: message("LCX_PLAIN")},
    {abap: `RAISE RESUMABLE EXCEPTION TYPE lcx_plain MESSAGE e001(zmsg).`, expected: message("LCX_PLAIN")},
    {abap: `RAISE EXCEPTION TYPE lcx_plain_sub MESSAGE e001(zmsg).`, expected: message("LCX_PLAIN_SUB")},
    {abap: `RAISE EXCEPTION TYPE lcx_other MESSAGE e001(zmsg).`, expected: message("LCX_OTHER")},
    {abap: `DATA(val) = COND i( WHEN 1 = 2 THEN 1 ELSE THROW lcx_plain( MESSAGE e001(zmsg) ) ).`, expected: message("LCX_PLAIN")},
    {abap: `DATA(val) = SWITCH i( 1 WHEN 2 THEN 1 ELSE THROW lcx_plain( MESSAGE e001(zmsg) ) ).`, expected: message("LCX_PLAIN")},
    {abap: `RAISE EXCEPTION TYPE lcx_t100 MESSAGE e001(zmsg) EXPORTING textid = VALUE #( ).`, expected: textid},
    {abap: `RAISE EXCEPTION TYPE cx_some_void MESSAGE e001(zmsg) EXPORTING textid = cx_some_void=>foo.`, expected: textid},
  ];

  for (const e of errors) {
    it(e.abap, () => {
      expect(runProgram(e.abap)).to.deep.equal([e.expected]);
    });
  }

  const ok: string[] = [
    `RAISE EXCEPTION TYPE lcx_t100 MESSAGE e001(zmsg).`,
    `RAISE EXCEPTION TYPE lcx_t100_sub MESSAGE e001(zmsg).`,
    `RAISE EXCEPTION TYPE lcx_dyn MESSAGE ID 'ZMSG' TYPE 'E' NUMBER '001' WITH 'a'.`,
    `RAISE EXCEPTION TYPE lcx_nested MESSAGE e001(zmsg).`,
    `RAISE EXCEPTION TYPE lcx_void_interface MESSAGE e001(zmsg).`,
    `RAISE EXCEPTION TYPE cx_some_void MESSAGE e001(zmsg).`,
    `RAISE EXCEPTION TYPE lcx_t100 MESSAGE e001(zmsg) EXPORTING previous = VALUE #( ).`,
    `RAISE EXCEPTION TYPE lcx_plain USING MESSAGE.`,
    `RAISE EXCEPTION TYPE lcx_plain.`,
    `RAISE EXCEPTION TYPE lcx_plain EXPORTING textid = VALUE #( ).`,
    `RAISE EXCEPTION NEW lcx_plain( ).`,
    `DATA(val) = COND i( WHEN 1 = 2 THEN 1 ELSE THROW lcx_plain( ) ).`,
    `DATA(val) = COND i( WHEN 1 = 2 THEN 1 ELSE THROW lcx_t100( MESSAGE e001(zmsg) ) ).`,
    `DATA(val) = SWITCH i( 1 WHEN 2 THEN 1 ELSE THROW lcx_dyn( MESSAGE e001(zmsg) ) ).`,
  ];

  for (const abap of ok) {
    it(abap, () => {
      expect(runProgram(abap)).to.deep.equal([]);
    });
  }

  it("global classes", () => {
    const root = `CLASS cx_root DEFINITION PUBLIC ABSTRACT CREATE PUBLIC.
ENDCLASS.
CLASS cx_root IMPLEMENTATION.
ENDCLASS.`;
    const noCheck = `CLASS cx_no_check DEFINITION PUBLIC INHERITING FROM cx_root ABSTRACT CREATE PUBLIC.
ENDCLASS.
CLASS cx_no_check IMPLEMENTATION.
ENDCLASS.`;
    const plain = `CLASS zcx_plain DEFINITION PUBLIC INHERITING FROM cx_no_check CREATE PUBLIC.
ENDCLASS.
CLASS zcx_plain IMPLEMENTATION.
ENDCLASS.`;
    const t100 = `CLASS zcx_t100 DEFINITION PUBLIC INHERITING FROM zcx_plain CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_t100_dyn_msg.
ENDCLASS.
CLASS zcx_t100 IMPLEMENTATION.
ENDCLASS.`;
    const prog = `RAISE EXCEPTION TYPE zcx_plain MESSAGE e001(zmsg).
RAISE EXCEPTION TYPE zcx_t100 MESSAGE e001(zmsg).`;
    const issues = runMulti([
      {filename: "cx_root.clas.abap", contents: root},
      {filename: "cx_no_check.clas.abap", contents: noCheck},
      {filename: "zcx_plain.clas.abap", contents: plain},
      {filename: "zcx_t100.clas.abap", contents: t100},
      {filename: "zraise_global.prog.abap", contents: prog},
    ]).map(i => i.getMessage());
    expect(issues).to.deep.equal([message("ZCX_PLAIN")]);
  });

});
