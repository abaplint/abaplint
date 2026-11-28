import {expect} from "chai";
import {runProgram} from "./syntax";

const program = (body: string): string => `
REPORT zwhen.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-DATA attr TYPE i.
    CLASS-METHODS get IMPORTING p TYPE i OPTIONAL RETURNING VALUE(r) TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
ENDCLASS.
DATA a TYPE i.
DATA b TYPE i.
DATA c TYPE c LENGTH 10.
DATA s TYPE string.
DATA x TYPE x LENGTH 4.
DATA f TYPE f.
DATA ref TYPE REF TO i.
DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
FIELD-SYMBOLS <i> TYPE i.
START-OF-SELECTION.
${body}`;

const issuesOf = (body: string) => runProgram(program(body)).map(i => i.getMessage());
const when = (value: string) => issuesOf(`CASE a.\n  WHEN ${value}.\nENDCASE.`);

describe("syntax.ts, calculations after WHEN", () => {

  const arithmetic = ["b + 1", "b - 1", "b * 2", "b / 2", "b ** 2", "b MOD 2", "b DIV 2", "- b", "+ b", "- 1",
    "( b + 1 )", "1 OR b * 2", "b + 1 OR 2", "1 OR 2 OR - b", "lcl=>get( ) + 1", "abs( b ) + 1",
    "lines( tab ) + 1", "CONV i( b ) + 1", "ipow( base = b exp = 2 )", "nmax( val1 = a val2 = b )",
    "nmin( val1 = a val2 = b )", "round( val = f dec = 1 )", "abs( b + 0 )", "abs( - b )", "abs( strlen( s ) )",
    "1 OR abs( b + 0 )"];
  for (const value of arithmetic) {
    it("error, WHEN " + value, () => {
      expect(when(value)).to.deep.equal(["Arithmetic expression not allowed after WHEN"]);
    });
  }

  const functions = ["abs( lcl=>get( ) )", "abs( tab[ 1 ] )", "abs( CONV i( b ) )", "abs( VALUE i( ) )",
    "abs( ( b ) )", "lines( VALUE string_table( ) )", "strlen( condense( s ) )", "strlen( c && s )",
    "count( val = s sub = 'a' )", "find( val = s sub = 'a' )", "1 OR abs( lcl=>get( ) )"];
  for (const value of functions) {
    it("error, WHEN " + value, () => {
      const issues = when(value);
      expect(issues.length).to.equal(1);
      expect(issues[0]).to.include("not allowed after WHEN, only a function of a data object");
    });
  }

  const ok = ["b", "1", "-1", "1 OR -1 OR b", "lcl=>attr", "ref->*", "<i>", "sy-index", "lcl=>get( )",
    "lcl=>get( b + 1 )", "lcl=>get( p = b * 2 )", "abs( b )", "abs( -1 )", "abs( ref->* )", "abs( <i> )",
    "abs( lcl=>attr )", "abs( sy-index )", "sign( f )", "ceil( f )", "sqrt( b )", "strlen( 'a' )", "strlen( \`a\` )",
    "strlen( s )", "strlen( c+1(2) )", "strlen( text-001 )", "xstrlen( x )", "numofchar( s )", "charlen( s )",
    "lines( tab )", "CONV i( b + 1 )", "COND i( WHEN a = 1 THEN b + 1 )"];
  for (const value of ok) {
    it("ok, WHEN " + value, () => {
      expect(when(value)).to.deep.equal([]);
    });
  }

  for (const operand of ["a + 1", "- a", "abs( a + 1 )", "ipow( base = a exp = 2 )"]) {
    it("ok, CASE " + operand, () => {
      expect(issuesOf(`CASE ${operand}.\n  WHEN 1.\nENDCASE.`)).to.deep.equal([]);
    });
  }

  it("ok, a method of the class hides the built-in function", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS abs IMPORTING p TYPE i RETURNING VALUE(r) TYPE i.
    CLASS-METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD abs.
  ENDMETHOD.
  METHOD run.
    DATA a TYPE i.
    CASE a.
      WHEN abs( a + 1 ).
    ENDCASE.
  ENDMETHOD.
ENDCLASS.`;
    expect(runProgram(abap).map(i => i.getMessage())).to.deep.equal([]);
  });

});
