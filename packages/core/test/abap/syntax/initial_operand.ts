import {expect} from "chai";
import {runProgram} from "./syntax";
import {Release} from "../../../src/version";

const program = (condition: string): string => `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty_tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.
    CLASS-METHODS get_int RETURNING VALUE(r) TYPE i.
    CLASS-METHODS get_string RETURNING VALUE(r) TYPE string.
    CLASS-METHODS get_tab RETURNING VALUE(r) TYPE ty_tab.
    CLASS-METHODS run.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get_int.
  ENDMETHOD.
  METHOD get_string.
  ENDMETHOD.
  METHOD get_tab.
  ENDMETHOD.
  METHOD run.
    DATA i TYPE i.
    DATA c TYPE c LENGTH 4.
    DATA s TYPE string.
    DATA x TYPE x LENGTH 4.
    DATA u TYPE utclong.
    DATA d TYPE decfloat34.
    DATA itab TYPE ty_tab.
    DATA nested TYPE STANDARD TABLE OF ty_tab WITH EMPTY KEY.
    DATA r TYPE REF TO ty_tab.
    IF ${condition}.
    ENDIF.
  ENDMETHOD.
ENDCLASS.`;

const messages = (condition: string, release = Release.v758): string[] =>
  runProgram(program(condition), [], release).map(i => i.getMessage());

describe("syntax.ts, expression as the operand of IS INITIAL", () => {
  const message = "An arithmetic, string or bit expression cannot be the operand of IS INITIAL";

  const expressions = [
    "- i IS INITIAL",
    "- 1 IS INITIAL",
    "+ i IS INITIAL",
    "i + 1 IS NOT INITIAL",
    "i ** 2 IS INITIAL",
    "i MOD 2 IS INITIAL",
    "( i + 1 ) IS INITIAL",
    "( ( i + 1 ) ) IS INITIAL",
    "( i ) + 1 IS INITIAL",
    "get_int( ) + 1 IS INITIAL",
    "itab[ 1 ] + 1 IS INITIAL",
    "CONV i( c ) + 1 IS INITIAL",
    "( abs( i + 1 ) + 1 ) IS INITIAL",
    "s && c IS INITIAL",
    "( s && c ) IS INITIAL",
    "'a' && 'b' IS INITIAL",
    "CONV string( s ) && c IS INITIAL",
    "|{ i }| IS INITIAL",
    "( |a| ) IS NOT INITIAL",
    "x BIT-AND x IS INITIAL",
    "x BIT-OR x IS INITIAL",
    "BIT-NOT x IS INITIAL",
    "( BIT-NOT x ) IS INITIAL",
    "NOT i + 1 IS INITIAL",
    "i = 1 OR i + 1 IS INITIAL",
    "boolc( i + 1 IS INITIAL ) = abap_true",
  ];

  for (const condition of expressions) {
    it(`error, ${condition}`, () => {
      expect(messages(condition)).to.deep.equal([message]);
    });
  }
});

describe("syntax.ts, built-in function as the operand of IS INITIAL, other results", () => {
  const functions: [string, string][] = [
    ["ipow", "ipow( base = i exp = 2 ) IS INITIAL"],
    ["nmax", "nmax( val1 = i val2 = 1 ) IS INITIAL"],
    ["nmin", "nmin( val1 = i val2 = 1 ) IS INITIAL"],
    ["round", "round( val = d dec = 1 ) IS INITIAL"],
    ["rescale", "rescale( val = d dec = 1 ) IS INITIAL"],
    ["count", "count( val = s sub = `a` ) IS INITIAL"],
    ["count_any_of", "count_any_of( val = s sub = `a` ) IS INITIAL"],
    ["count_any_not_of", "count_any_not_of( val = s sub = `a` ) IS INITIAL"],
    ["find", "find( val = s sub = `a` ) IS NOT INITIAL"],
    ["find_end", "find_end( val = s sub = `a` ) IS INITIAL"],
    ["find_any_of", "find_any_of( val = s sub = `a` ) IS INITIAL"],
    ["find_any_not_of", "find_any_not_of( val = s sub = `a` ) IS INITIAL"],
    ["distance", "distance( val1 = s val2 = c ) IS INITIAL"],
    ["line_index", "line_index( itab[ table_line = 1 ] ) IS INITIAL"],
    ["utclong_diff", "utclong_diff( high = u low = u ) IS INITIAL"],
    ["count", "( count( val = s sub = `a` ) ) IS INITIAL"],
    ["condense", "( condense( s ) ) IS INITIAL"],
    ["boolc", "( boolc( i = 1 ) ) IS INITIAL"],
    ["boolx", "boolx( bool = i = 1 bit = 1 ) IS INITIAL"],
    ["bit-set", "bit-set( 1 ) IS INITIAL"],
  ];

  for (const [name, condition] of functions) {
    it(`error, ${condition}`, () => {
      expect(messages(condition)).to.deep.equal([`Built-in function "${name}" cannot be the operand of IS INITIAL`]);
    });
  }
});

describe("syntax.ts, argument of a built-in function as the operand of IS INITIAL", () => {
  const calculated: [string, string][] = [
    ["abs", "abs( i + 1 ) IS INITIAL"],
    ["abs", "abs( - i ) IS INITIAL"],
    ["abs", "abs( ( i + 1 ) ) IS INITIAL"],
    ["abs", "abs( strlen( s ) ) IS INITIAL"],
    ["abs", "abs( abs( i ) ) IS INITIAL"],
    ["abs", "( abs( i + 1 ) ) IS INITIAL"],
    ["abs", "abs( ipow( base = i exp = 2 ) ) IS INITIAL"],
    ["abs", "abs( get_int( ) ) IS INITIAL"],
    ["abs", "abs( CONV i( c ) ) IS INITIAL"],
    ["abs", "abs( itab[ 1 ] ) IS INITIAL"],
    ["strlen", "strlen( s && s ) IS INITIAL"],
    ["strlen", "strlen( |a| ) IS INITIAL"],
    ["strlen", "strlen( to_upper( s ) ) IS INITIAL"],
    ["strlen", "strlen( get_string( ) ) IS INITIAL"],
    ["strlen", "strlen( CONV string( c ) ) IS INITIAL"],
    ["lines", "lines( get_tab( ) ) IS INITIAL"],
    ["lines", "lines( VALUE ty_tab( ) ) IS INITIAL"],
    ["lines", "lines( nested[ 1 ] ) IS INITIAL"],
  ];

  for (const [name, condition] of calculated) {
    it(`error, ${condition}`, () => {
      expect(messages(condition)).to.deep.equal([`The argument of "${name}" must be a data object in the operand of IS INITIAL`]);
    });
  }

  it("a named argument is reported once", () => {
    expect(messages("abs( val = i ) IS INITIAL").length).to.equal(1);
  });
});

describe("syntax.ts, valid operand of IS INITIAL", () => {
  const valid = [
    "i IS INITIAL",
    "( i ) IS INITIAL",
    "( ( i ) ) IS INITIAL",
    "x IS NOT INITIAL",
    "c+1(1) IS INITIAL",
    "itab[] IS INITIAL",
    "r->* IS INITIAL",
    "-1 IS INITIAL",
    "'a' IS INITIAL",
    "'a' & 'b' IS INITIAL",
    "get_int( ) IS INITIAL",
    "( get_int( ) ) IS INITIAL",
    "CONV i( c ) IS INITIAL",
    "CONV i( i + 1 ) IS INITIAL",
    "CONV string( s && s ) IS INITIAL",
    "( CONV i( c ) ) IS INITIAL",
    "COND i( WHEN i = 1 THEN i + 1 ) IS INITIAL",
    "itab[ 1 ] IS INITIAL",
    "( itab[ 1 ] ) IS INITIAL",
    "abs( i ) IS INITIAL",
    "( abs( i ) ) IS INITIAL",
    "( ( abs( i ) ) ) IS INITIAL",
    "abs( -1 ) IS INITIAL",
    "abs( sy-index ) IS INITIAL",
    "sign( i ) IS INITIAL",
    "ceil( d ) IS INITIAL",
    "floor( d ) IS INITIAL",
    "trunc( d ) IS INITIAL",
    "frac( d ) IS INITIAL",
    "sqrt( i ) IS INITIAL",
    "exp( i ) IS INITIAL",
    "log10( i ) IS INITIAL",
    "strlen( s ) IS INITIAL",
    "strlen( c+1(1) ) IS INITIAL",
    "strlen( 'a' ) IS INITIAL",
    "strlen( `a` ) IS INITIAL",
    "strlen( 'a' & 'b' ) IS INITIAL",
    "xstrlen( x ) IS INITIAL",
    "numofchar( s ) IS INITIAL",
    "charlen( s ) IS INITIAL",
    "dbmaxlen( s ) IS INITIAL",
    "lines( itab ) IS NOT INITIAL",
    "lines( itab[] ) IS INITIAL",
    "lines( r->* ) IS INITIAL",
    "utclong_current( ) IS INITIAL",
    "( utclong_current( ) ) IS INITIAL",
    "utclong_add( val = u seconds = 1 ) IS INITIAL",
    "utclong_add( val = u seconds = i + 1 ) IS INITIAL",
    "i + 1 = 1 AND i IS INITIAL",
  ];

  for (const condition of valid) {
    it(`ok, ${condition}`, () => {
      expect(messages(condition)).to.deep.equal([]);
    });
  }

  it("ok, a calculation in open-abap", () => {
    expect(messages("i + 1 IS INITIAL", Release["open-abap"])).to.deep.equal([]);
  });
});
