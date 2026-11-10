import {expect} from "chai";
import {runProgram} from "./syntax";
import {Release} from "../../../src/version";

const program = (body: string): string => `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS get_int RETURNING VALUE(r) TYPE i.
    METHODS run.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get_int.
  ENDMETHOD.
  METHOD run.
    DATA itab TYPE STANDARD TABLE OF i WITH EMPTY KEY.
    DATA stab TYPE STANDARD TABLE OF string WITH EMPTY KEY.
    DATA s TYPE string.
    DATA c10 TYPE c LENGTH 10.
    DATA c20 TYPE c LENGTH 20.
    DATA x TYPE i.
    DATA f TYPE f.
    DATA r TYPE REF TO string.
    ${body}
  ENDMETHOD.
ENDCLASS.`;

const errors = (body: string): string | undefined => runProgram(program(body))[0]?.getMessage();
const openABAP = (body: string): string | undefined => runProgram(program(body), [], Release["open-abap"])[0]?.getMessage();

describe("syntax.ts, predicate function outside a logical expression", () => {
  const message = (name: string) => `Predicate function "${name}" can only be used in a logical expression`;

  it("error, assigned inline", () => {
    expect(errors(`DATA(b) = line_exists( itab[ table_line = 1 ] ).`)).to.equal(message("line_exists"));
  });

  it("error, assigned", () => {
    expect(errors(`DATA b TYPE abap_bool.
    b = contains( val = s sub = \`b\` ).`)).to.equal(message("contains"));
  });

  it("error, in WRITE", () => {
    expect(errors(`WRITE / matches( val = s regex = \`a.*\` ).`)).to.equal(message("matches"));
  });

  it("error, in a string template", () => {
    expect(errors(`s = |{ line_exists( itab[ table_line = 1 ] ) }|.`)).to.equal(message("line_exists"));
  });

  it("error, as a method argument", () => {
    expect(errors(`DATA(o) = cl_abap_typedescr=>describe_by_data( line_exists( itab[ 1 ] ) ).`)).to.equal(message("line_exists"));
  });

  it("error, in CONV", () => {
    expect(errors(`DATA(b) = CONV abap_bool( line_exists( itab[ 1 ] ) ).`)).to.equal(message("line_exists"));
  });

  it("error, comparison keeps its own message", () => {
    expect(errors(`IF line_exists( itab[ 1 ] ) = abap_true.
    ENDIF.`)).to.equal(`Predicate function "line_exists" cannot be the operand of a comparison`);
  });

  it("ok, as conditions", () => {
    expect(errors(`IF line_exists( itab[ 1 ] ). ENDIF.
    CHECK NOT contains( val = s sub = \`b\` ).
    ASSERT matches( val = s regex = \`a.*\` ).
    DATA(c) = COND i( WHEN line_exists( itab[ 1 ] ) THEN 1 ).`)).to.equal(undefined);
  });

  it("ok, inside xsdbool( ) and boolc( )", () => {
    expect(errors(`DATA(b) = xsdbool( line_exists( itab[ 1 ] ) ).
    s = boolc( contains( val = s sub = \`b\` ) ).`)).to.equal(undefined);
  });

  it("ok, inside boolc( ) in 702, where it parses as a method call", () => {
    const abap = `
DATA s TYPE string.
DATA b TYPE abap_bool.
b = boolc( contains( val = s sub = \`b\` ) ).
IF boolc( matches( val = s regex = \`a.*\` ) ) = abap_true.
ENDIF.`;
    expect(runProgram(abap, [], Release.v702)[0]?.getMessage()).to.equal(undefined);
  });

  it("error, assigned in 702", () => {
    const abap = `
DATA s TYPE string.
DATA b TYPE abap_bool.
b = contains( val = s sub = \`b\` ).`;
    expect(runProgram(abap, [], Release.v702)[0]?.getMessage()).to.equal(message("contains"));
  });

  it("ok, open-abap", () => {
    expect(openABAP(`DATA(b) = line_exists( itab[ table_line = 1 ] ).`)).to.equal(undefined);
  });

  it("ok, a method named like a predicate function hides it", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS contains IMPORTING val TYPE string sub TYPE string RETURNING VALUE(r) TYPE abap_bool.
    METHODS run.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD contains.
  ENDMETHOD.
  METHOD run.
    DATA(b) = contains( val = \`a\` sub = \`b\` ).
  ENDMETHOD.
ENDCLASS.`;
    expect(runProgram(abap)[0]?.getMessage()).to.equal(undefined);
  });
});

describe("syntax.ts, numeric function in WRITE", () => {
  const message = (name: string) => `Numeric function "${name}" in WRITE takes only a single data object as argument`;

  it("error, line_index( ) of a table expression", () => {
    expect(errors(`WRITE / line_index( itab[ table_line = 1 ] ).`)).to.equal(message("line_index"));
  });

  it("error, WRITE TO", () => {
    expect(errors(`WRITE line_index( itab[ table_line = 1 ] ) TO c20.`)).to.equal(message("line_index"));
  });

  it("error, a table expression argument", () => {
    expect(errors(`WRITE / strlen( stab[ 1 ] ).`)).to.equal(message("strlen"));
  });

  it("error, an arithmetic argument", () => {
    expect(errors(`WRITE / abs( x + 1 ).`)).to.equal(message("abs"));
  });

  it("error, a nested function call", () => {
    expect(errors(`WRITE / strlen( to_upper( s ) ).`)).to.equal(message("strlen"));
  });

  it("error, named parameters", () => {
    expect(errors(`WRITE / find( val = s sub = \`a\` ).`)).to.equal(message("find"));
  });

  it("ok, data objects", () => {
    expect(errors(`WRITE / abs( x ).
    WRITE / strlen( s ).
    WRITE / lines( itab ).
    WRITE / abs( -1 ).
    WRITE / strlen( c10+1(2) ).
    WRITE / sqrt( f ).
    WRITE / strlen( r->* ).
    WRITE lines( itab ) TO c20.`)).to.equal(undefined);
  });

  it("ok, functions with a character result, and methods", () => {
    expect(errors(`WRITE / to_upper( stab[ 1 ] ).
    WRITE / to_upper( val = s ).
    WRITE / get_int( ).`)).to.equal(undefined);
  });

  it("ok, line_index( ) outside WRITE", () => {
    expect(errors(`x = line_index( itab[ table_line = 1 ] ) + 1.
    s = |{ line_index( itab[ table_line = 1 ] ) }|.`)).to.equal(undefined);
  });

  it("ok, open-abap", () => {
    expect(openABAP(`WRITE / line_index( itab[ table_line = 1 ] ).`)).to.equal(undefined);
  });
});

describe("syntax.ts, numeric function in MESSAGE WITH", () => {
  const message = (name: string) => `Numeric function "${name}" cannot be used in MESSAGE WITH`;

  it("error, lines( )", () => {
    expect(errors(`MESSAGE e001(00) WITH lines( itab ).`)).to.equal(message("lines"));
  });

  it("error, line_index( ) as second operand", () => {
    expect(errors(`MESSAGE e001(00) WITH s line_index( itab[ table_line = 1 ] ).`)).to.equal(message("line_index"));
  });

  it("ok, a function with a character result, and a method", () => {
    expect(errors(`MESSAGE e001(00) WITH to_upper( s ) get_int( ).`)).to.equal(undefined);
  });

  it("ok, open-abap", () => {
    expect(openABAP(`MESSAGE e001(00) WITH lines( itab ).`)).to.equal(undefined);
  });
});
