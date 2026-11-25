import {expect} from "chai";
import {runMulti, runProgram} from "./syntax";

// a data object passed to a by-reference IMPORTING parameter with a complete elementary type must be compatible
const header = `
TYPES: BEGIN OF ty_dfies,
         leng TYPE n LENGTH 6,
         name TYPE c LENGTH 30,
       END OF ty_dfies.
TYPES ty_amount TYPE p LENGTH 15 DECIMALS 2.
TYPES ty_num TYPE n LENGTH 6.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS take_dec IMPORTING i_value TYPE decfloat34 OPTIONAL.
    CLASS-METHODS take_dec_value IMPORTING VALUE(i_value) TYPE decfloat34 OPTIONAL.
    CLASS-METHODS take_str IMPORTING v TYPE string.
    CLASS-METHODS take_i IMPORTING v TYPE i.
    CLASS-METHODS take_p IMPORTING v TYPE p.
    CLASS-METHODS take_pdec IMPORTING v TYPE ty_amount.
    CLASS-METHODS take_num IMPORTING v TYPE ty_num.
    CLASS-METHODS take_numeric IMPORTING v TYPE numeric.
    CLASS-METHODS take_clike IMPORTING v TYPE clike.
    CLASS-METHODS take_csequence IMPORTING v TYPE csequence.
    CLASS-METHODS take_simple IMPORTING v TYPE simple.
    CLASS-METHODS take_any IMPORTING v TYPE any.
    CLASS-METHODS take_data IMPORTING v TYPE data.
    CLASS-METHODS take_c IMPORTING v TYPE c.
    CLASS-METHODS take_ref IMPORTING v TYPE REF TO data.
    CLASS-METHODS take_obj IMPORTING v TYPE REF TO object.
    CLASS-METHODS change_dec CHANGING c_value TYPE decfloat34.
    CLASS-METHODS export_dec EXPORTING e_value TYPE decfloat34.
    CLASS-METHODS get_p RETURNING VALUE(r) TYPE p.
    METHODS a IMPORTING n TYPE string v TYPE string OPTIONAL RETURNING VALUE(r) TYPE REF TO lcl.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD take_dec.
  ENDMETHOD.
  METHOD take_dec_value.
  ENDMETHOD.
  METHOD take_str.
  ENDMETHOD.
  METHOD take_i.
  ENDMETHOD.
  METHOD take_p.
  ENDMETHOD.
  METHOD take_pdec.
  ENDMETHOD.
  METHOD take_num.
  ENDMETHOD.
  METHOD take_numeric.
  ENDMETHOD.
  METHOD take_clike.
  ENDMETHOD.
  METHOD take_csequence.
  ENDMETHOD.
  METHOD take_simple.
  ENDMETHOD.
  METHOD take_any.
  ENDMETHOD.
  METHOD take_data.
  ENDMETHOD.
  METHOD take_c.
  ENDMETHOD.
  METHOD take_ref.
  ENDMETHOD.
  METHOD take_obj.
  ENDMETHOD.
  METHOD change_dec.
  ENDMETHOD.
  METHOD export_dec.
  ENDMETHOD.
  METHOD get_p.
  ENDMETHOD.
  METHOD a.
    r = me.
  ENDMETHOD.
ENDCLASS.

DATA amount TYPE p LENGTH 15 DECIMALS 2.
DATA amount3 TYPE p LENGTH 15 DECIMALS 3.
DATA amount8 TYPE p LENGTH 8 DECIMALS 2.
DATA dec34 TYPE decfloat34.
DATA dec16 TYPE decfloat16.
DATA int TYPE i.
DATA int8 TYPE int8.
DATA flt TYPE f.
DATA str TYPE string.
DATA num6 TYPE n LENGTH 6.
DATA num4 TYPE n LENGTH 4.
DATA char6 TYPE c LENGTH 6.
DATA ref TYPE REF TO data.
DATA obj TYPE REF TO object.
DATA dfies TYPE REF TO ty_dfies.
DATA view TYPE REF TO lcl.
FIELD-SYMBOLS <any> TYPE any.
FIELD-SYMBOLS <p> TYPE p.
CONSTANTS c_num TYPE n LENGTH 6 VALUE '000001'.
`;

function expectReported(code: string) {
  const issues = runProgram(header + code);
  expect(issues.length).to.equal(1, issues.map(i => i.getMessage()).join(", "));
  expect(issues[0].getMessage()).to.contain("is not compatible with the type");
}

// already reported by the existing type check of the parameter
function expectReportedBefore(code: string) {
  const issues = runProgram(header + code);
  expect(issues.length).to.equal(1, issues.map(i => i.getMessage()).join(", "));
}

function expectNothing(code: string) {
  const issues = runProgram(header + code);
  expect(issues.map(i => i.getMessage())).to.deep.equal([]);
}

describe("syntax.ts, data object passed to a by-reference IMPORTING parameter", () => {

  it("header without calls, no issues", () => {
    expectNothing("");
  });

  // reported

  it("p LENGTH 15 DECIMALS 2 to decfloat34", () => {
    const issues = runProgram(header + `lcl=>take_dec( amount ).`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal(
      `The type "p LENGTH 15 DECIMALS 2" of "amount" is not compatible with the type "decfloat34" of "i_value", passed by reference`);
  });

  it("p to decfloat34, named", () => {
    expectReported(`lcl=>take_dec( i_value = amount ).`);
  });

  it("p to decfloat34, CALL METHOD EXPORTING", () => {
    expectReported(`CALL METHOD lcl=>take_dec EXPORTING i_value = amount.`);
  });

  it("p to decfloat34, functional call EXPORTING", () => {
    expectReported(`lcl=>take_dec( EXPORTING i_value = amount ).`);
  });

  it("view builder, n LENGTH 6 component to string", () => {
    expectReported(`view = NEW #( ).
CREATE DATA dfies.
view->a( n = \`maxLength\` v = dfies->leng ).`);
  });

  it("n LENGTH 6 to string, default parameter", () => {
    expectReported(`lcl=>take_str( num6 ).`);
  });

  it("named constant n LENGTH 6 to string", () => {
    expectReported(`lcl=>take_str( c_num ).`);
  });

  it("string to n LENGTH 6", () => {
    expectReported(`lcl=>take_num( str ).`);
  });

  it("n LENGTH 4 to n LENGTH 6", () => {
    expectReported(`lcl=>take_num( num4 ).`);
  });

  it("i to p LENGTH 15 DECIMALS 2", () => {
    expectReportedBefore(`lcl=>take_pdec( int ).`);
  });

  it("p LENGTH 15 DECIMALS 3 to p LENGTH 15 DECIMALS 2", () => {
    expectReportedBefore(`lcl=>take_pdec( amount3 ).`);
  });

  it("p LENGTH 8 DECIMALS 2 to p LENGTH 15 DECIMALS 2", () => {
    expectReportedBefore(`lcl=>take_pdec( amount8 ).`);
  });

  it("p to i", () => {
    expectReported(`lcl=>take_i( amount ).`);
  });

  it("decfloat16, int8 and f to decfloat34", () => {
    expectReported(`lcl=>take_dec( dec16 ).`);
    expectReported(`lcl=>take_dec( int8 ).`);
    expectReported(`lcl=>take_dec( flt ).`);
  });

  it("i to decfloat34", () => {
    expectReported(`lcl=>take_dec( int ).`);
  });

  it("typed field symbol, p to decfloat34", () => {
    expectReported(`ASSIGN amount TO <p>.
lcl=>take_dec( <p> ).`);
  });

  it("NEW, constructor parameter by reference", () => {
    const issues = runProgram(`
CLASS lcl_c DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING v TYPE decfloat34.
ENDCLASS.
CLASS lcl_c IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.
DATA amount TYPE p LENGTH 15 DECIMALS 2.
DATA(o) = NEW lcl_c( amount ).`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("is not compatible with the type");
  });

  it("CREATE OBJECT, constructor parameter by reference", () => {
    const issues = runProgram(`
CLASS lcl_c DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING v TYPE decfloat34.
ENDCLASS.
CLASS lcl_c IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.
DATA amount TYPE p LENGTH 15 DECIMALS 2.
DATA o TYPE REF TO lcl_c.
CREATE OBJECT o EXPORTING v = amount.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("is not compatible with the type");
  });

  it("CREATE OBJECT and NEW, constructor parameter by value", () => {
    const issues = runProgram(`
CLASS lcl_c DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING VALUE(v) TYPE decfloat34.
ENDCLASS.
CLASS lcl_c IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.
DATA amount TYPE p LENGTH 15 DECIMALS 2.
DATA o TYPE REF TO lcl_c.
CREATE OBJECT o EXPORTING v = amount.
o = NEW #( amount ).`);
    expect(issues.map(i => i.getMessage())).to.deep.equal([]);
  });

  it("global class, decfloat34 parameter", () => {
    const issues = runMulti([{filename: "zcl_take.clas.abap", contents: `
CLASS zcl_take DEFINITION PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS factory IMPORTING i_value TYPE decfloat34 OPTIONAL.
ENDCLASS.
CLASS zcl_take IMPLEMENTATION.
  METHOD factory.
  ENDMETHOD.
ENDCLASS.`}, {filename: "zcl_user.clas.abap", contents: `
CLASS zcl_user DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA amount TYPE p LENGTH 15 DECIMALS 2.
    METHODS run.
ENDCLASS.
CLASS zcl_user IMPLEMENTATION.
  METHOD run.
    zcl_take=>factory( i_value = me->amount ).
  ENDMETHOD.
ENDCLASS.`}]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("is not compatible with the type");
  });

  // not reported

  it("compatible, same type and length", () => {
    expectNothing(`lcl=>take_dec( dec34 ).
lcl=>take_pdec( amount ).
lcl=>take_num( num6 ).
lcl=>take_str( str ).
lcl=>take_i( int ).`);
  });

  it("formal passed by value", () => {
    expectNothing(`lcl=>take_dec_value( amount ).
lcl=>take_dec_value( int ).`);
  });

  it("generic formals", () => {
    expectNothing(`lcl=>take_numeric( amount ).
lcl=>take_p( amount ).
lcl=>take_p( amount3 ).
lcl=>take_clike( num6 ).
lcl=>take_csequence( str ).
lcl=>take_simple( num6 ).
lcl=>take_any( amount ).
lcl=>take_data( amount ).
lcl=>take_c( char6 ).`);
  });

  it("expression as actual", () => {
    expectNothing(`lcl=>take_dec( amount * 2 ).
lcl=>take_str( |{ num6 }| ).
lcl=>take_dec( CONV #( amount ) ).
lcl=>take_str( condense( char6 ) ).`);
  });

  it("functional call as actual", () => {
    expectNothing(`lcl=>take_dec( lcl=>get_p( ) ).`);
  });

  it("literals as actual", () => {
    expectNothing(`lcl=>take_dec( 5 ).
lcl=>take_dec( '1.5' ).
lcl=>take_str( 'abc' ).
lcl=>take_pdec( 3 ).
lcl=>take_num( '000001' ).`);
  });

  it("references", () => {
    expectNothing(`lcl=>take_ref( ref ).
lcl=>take_obj( obj ).`);
  });

  it("generic field symbol", () => {
    expectNothing(`ASSIGN amount TO <any>.
lcl=>take_dec( <any> ).`);
  });

  it("CHANGING and EXPORTING", () => {
    expectNothing(`lcl=>change_dec( CHANGING c_value = dec34 ).
lcl=>export_dec( IMPORTING e_value = dec34 ).`);
  });

  it("inline declared variable", () => {
    expectNothing(`DATA(inline) = amount.
lcl=>take_dec( inline ).`);
  });

  it("offset and length", () => {
    expectNothing(`lcl=>take_num( num6+0(4) ).`);
  });

  it("void formal and void actual", () => {
    expectNothing(`DATA void TYPE zvoid_type.
lcl=>take_dec( void ).`);
  });

});
