import {expect} from "chai";
import {runProgram} from "./syntax";

const message = (name: string) => `"${name}" is a time stamp of type utclong, it cannot be used in a calculation`;

describe("syntax.ts, utclong in a calculation", () => {
  const program = (code: string): string => `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-DATA attr TYPE utclong.
    CLASS-METHODS get RETURNING VALUE(result) TYPE utclong.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
ENDCLASS.
TYPES: BEGIN OF ty_struc,
         u TYPE utclong,
       END OF ty_struc.
DATA u TYPE utclong.
DATA u2 TYPE utclong.
DATA i TYPE i.
DATA x TYPE x LENGTH 4.
DATA s TYPE string.
DATA struc TYPE ty_struc.
DATA tab TYPE STANDARD TABLE OF utclong WITH EMPTY KEY.
DATA ref TYPE REF TO utclong.
FIELD-SYMBOLS <u> TYPE utclong.
${code}`;

  const errors: {abap: string, name: string}[] = [
    {abap: `i = u + 1.`, name: "u"},
    {abap: `i = 1 + u.`, name: "u"},
    {abap: `i = u * 2.`, name: "u"},
    {abap: `i = u - u2.`, name: "u"},
    {abap: `u2 = u + 1.`, name: "u"},
    {abap: `i = u ** 2.`, name: "u"},
    {abap: `i = u MOD 2.`, name: "u"},
    {abap: `i = u DIV 2.`, name: "u"},
    {abap: `i = 1 + 2 * u.`, name: "u"},
    {abap: `i = - u.`, name: "u"},
    {abap: `u2 = - u.`, name: "u"},
    {abap: `u2 = + u.`, name: "u"},
    {abap: `i = ( u ) + 1.`, name: "u"},
    {abap: `i = 1 + ( u ).`, name: "( u )"},
    {abap: `i = struc-u + 1.`, name: "struc-u"},
    {abap: `i = <u> + 1.`, name: "<u>"},
    {abap: `i = ref->* + 1.`, name: "ref->*"},
    {abap: `i = tab[ 1 ] + 1.`, name: "tab[ 1 ]"},
    {abap: `i = lcl=>attr + 1.`, name: "lcl=>attr"},
    {abap: `i = lcl=>get( ) + 1.`, name: "lcl=>get( )"},
    {abap: `i = utclong_current( ) + 1.`, name: "utclong_current( )"},
    {abap: `i = 1 + CONV utclong( u ).`, name: "CONV utclong( u )"},
    {abap: `i = abs( u + 1 ).`, name: "u"},
    {abap: `IF u + 1 = i. ENDIF.`, name: "u"},
    {abap: `CASE u + 1. ENDCASE.`, name: "u"},
    {abap: `DO u + 1 TIMES. ENDDO.`, name: "u"},
    {abap: `s = |{ u + 1 }|.`, name: "u"},
    {abap: `u += u2.`, name: "u"},
    {abap: `u -= 1.`, name: "u"},
    {abap: `u *= u2.`, name: "u"},
    {abap: `u /= u2.`, name: "u"},
    {abap: `i += u.`, name: "u"},
    {abap: `struc-u += u2.`, name: "struc-u"},
    {abap: `u = REDUCE utclong( INIT r = u FOR j = 1 UNTIL j > 2 NEXT r += u2 ).`, name: "r"},
    {abap: `i = REDUCE i( INIT r = 0 FOR j = 1 UNTIL j > 2 NEXT r += u ).`, name: "u"},
    {abap: `i = REDUCE i( INIT r = 0 FOR j = 1 UNTIL j > 2 NEXT r -= u ).`, name: "u"},
    {abap: `i = REDUCE i( INIT r = 0 FOR j = 1 UNTIL j > 2 NEXT r *= u ).`, name: "u"},
    {abap: `i = REDUCE i( INIT r = 0 FOR j = 1 UNTIL j > 2 NEXT r /= u ).`, name: "u"},
    {abap: `ADD 1 TO u.`, name: "u"},
    {abap: `ADD u TO i.`, name: "u"},
    {abap: `SUBTRACT u FROM u2.`, name: "u"},
    {abap: `MULTIPLY u BY 2.`, name: "u"},
    {abap: `DIVIDE i BY u.`, name: "u"},
  ];

  for (const e of errors) {
    it("error: " + e.abap, () => {
      const issues = runProgram(program(e.abap));
      expect(issues.map(i => i.getMessage())).to.deep.equal([message(e.name)]);
    });
  }

  for (const abap of [`i = nmax( val1 = u val2 = 1 ).`, `i = nmin( val1 = 1 val2 = u ).`, `i = nmax( val1 = u val2 = u2 ).`,
    `i = nmax( val1 = 1 val2 = 2 val3 = u ).`]) {
    it("error: " + abap, () => {
      const issues = runProgram(program(abap));
      expect(issues.length).to.equal(1);
      expect(issues[0].getMessage()).to.include("Method parameter type not compatible");
    });
  }

  const ok: string[] = [
    `u = u2.`,
    `u2 = ( u ).`,
    `u = utclong_current( ).`,
    `u = utclong_add( val = u seconds = i + 1 ).`,
    `IF utclong_diff( high = u low = u2 ) + 1 = i. ENDIF.`,
    `i = lines( tab ) + 1.`,
    `s = |{ u }|.`,
    `s &&= |{ u }|.`,
    `i += 1.`,
    `i -= 1.`,
    `i *= 2.`,
    `i /= 2.`,
    `i = nmax( val1 = i val2 = 2 ).`,
    `i = REDUCE i( INIT r = 0 FOR j = 1 UNTIL j > 2 NEXT r += j ).`,
    `u = REDUCE utclong( INIT r = u FOR j = 1 UNTIL j > 2 NEXT r = utclong_add( val = r seconds = j ) ).`,
  ];

  for (const abap of ok) {
    it("ok: " + abap, () => {
      const issues = runProgram(program(abap));
      expect(issues.map(i => i.getMessage())).to.deep.equal([]);
    });
  }
});
