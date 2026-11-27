import {expect} from "chai";
import {Release} from "../../../src";
import {runProgram} from "./syntax";

const program = (body: string): string => `
DATA i TYPE i.
DATA s TYPE string.
DATA x TYPE xstring.
DATA flag TYPE abap_bool.
DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
${body}`;

const issuesOf = (body: string) => runProgram(program(body)).map(i => i.getMessage());

describe("syntax.ts, built-in functions with one unnamed argument", () => {

  const functions: [string, string][] = [
    ["abs", "i"], ["acos", "i"], ["asin", "i"], ["atan", "i"], ["ceil", "i"], ["charlen", "s"], ["cos", "i"],
    ["cosh", "i"], ["dbmaxlen", "s"], ["exp", "i"], ["floor", "i"], ["frac", "i"], ["lines", "tab"], ["log", "i"],
    ["log10", "i"], ["numofchar", "s"], ["sign", "i"], ["sin", "i"], ["sinh", "i"], ["sqrt", "i"],
    ["strlen", "s"], ["tan", "i"], ["tanh", "i"], ["trunc", "i"], ["xstrlen", "x"]];

  for (const [name, argument] of functions) {
    const message = `Built-in function "${name}" takes its argument without a parameter name`;

    it(`ok, ${name}( ${argument} )`, () => {
      expect(issuesOf(`DATA(result) = ${name}( ${argument} ).`)).to.deep.equal([]);
    });

    it(`error, ${name}( val = ${argument} )`, () => {
      expect(issuesOf(`DATA(result) = ${name}( val = ${argument} ).`)).to.deep.equal([message]);
    });
  }

  for (const body of [
    "i = abs( EXPORTING val = i ).",
    "i = ABS( VAL = i ).",
    "i = abs( foo = i ).",
    "i = 1 + abs( val = i ).",
    "i = abs( abs( val = i ) ).",
    "IF abs( val = i ) > 0.\nENDIF."]) {

    it("error, " + body, () => {
      expect(issuesOf(body)).to.deep.equal([`Built-in function "abs" takes its argument without a parameter name`]);
    });
  }

  for (const body of [
    "i = ipow( base = i exp = 2 ).",
    "i = nmax( val1 = i val2 = 1 ).",
    "i = round( val = i dec = 0 ).",
    "s = condense( val = s ).",
    "s = boolc( i = 1 ).",
    "flag = xsdbool( i = 1 )."]) {

    it("ok, " + body, () => {
      expect(issuesOf(body)).to.deep.equal([]);
    });
  }

  it("ok, boolc( ) with a comparison before 7.02", () => {
    const issues = runProgram(program("s = boolc( i = 1 )."), [], Release.v700);
    expect(issues.map(i => i.getMessage()).join()).to.not.include("without a parameter name");
  });

  it("ok, a method of the class hides the built-in function", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS abs IMPORTING val TYPE i RETURNING VALUE(r) TYPE i.
    CLASS-METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD abs.
  ENDMETHOD.
  METHOD run.
    DATA i TYPE i.
    i = abs( val = i ).
    i = lcl=>abs( val = i ).
  ENDMETHOD.
ENDCLASS.`;
    expect(runProgram(abap).map(i => i.getMessage())).to.deep.equal([]);
  });

});
