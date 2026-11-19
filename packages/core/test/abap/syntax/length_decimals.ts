import {expect} from "chai";
import {runProgram} from "./syntax";

const errors = (abap: string): string | undefined => runProgram(abap)[0]?.getMessage();

const lengthMessage = "\"LENGTH\" can only be specified for types C, N, X, or P";
const decimalsMessage = "\"DECIMALS\" can be specified only for type P";

describe("syntax.ts, LENGTH and DECIMALS additions", () => {

  it("error, issue #1988, TYPE d LENGTH DECIMALS", () => {
    expect(errors(`DATA tsl TYPE d LENGTH 21 DECIMALS 7.`)).to.equal(lengthMessage);
  });

  it("error, TYPE d LENGTH 8, also its own length", () => {
    expect(errors(`DATA tsl TYPE d LENGTH 8.`)).to.equal(lengthMessage);
  });

  it("error, TYPE string LENGTH", () => {
    expect(errors(`DATA s TYPE string LENGTH 5.`)).to.equal(lengthMessage);
  });

  it("error, TYPE i DECIMALS", () => {
    expect(errors(`DATA s TYPE i DECIMALS 2.`)).to.equal(decimalsMessage);
  });

  it("error, TYPE c LENGTH DECIMALS", () => {
    expect(errors(`DATA s TYPE c LENGTH 10 DECIMALS 2.`)).to.equal(decimalsMessage);
  });

  it("error, TYPE x LENGTH DECIMALS", () => {
    expect(errors(`DATA s TYPE x LENGTH 4 DECIMALS 1.`)).to.equal(decimalsMessage);
  });

  it("error, LENGTH without TYPE", () => {
    expect(errors(`DATA s LENGTH 5.`)).to.equal(lengthMessage);
  });

  it("error, DECIMALS without TYPE", () => {
    expect(errors(`DATA s DECIMALS 2.`)).to.equal(decimalsMessage);
  });

  it("error, a named type cannot be given a length, even a character-like one", () => {
    expect(errors(`TYPES ty TYPE c LENGTH 5.
TYPES bar TYPE ty LENGTH 3.`)).to.equal(lengthMessage);
  });

  it("error, a named type cannot be given decimals", () => {
    expect(errors(`TYPES ty TYPE c LENGTH 5.
TYPES bar TYPE ty DECIMALS 2.`)).to.equal(decimalsMessage);
  });

  it("error, CONSTANTS", () => {
    expect(errors(`CONSTANTS k TYPE d LENGTH 8 VALUE '20200101'.`)).to.equal(lengthMessage);
  });

  it("error, STATICS", () => {
    expect(errors(`FORM f.
  STATICS st TYPE n LENGTH 4 DECIMALS 1.
ENDFORM.`)).to.equal(decimalsMessage);
  });

  it("error, CLASS-DATA", () => {
    expect(errors(`CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-DATA cd TYPE t LENGTH 6.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.`)).to.equal(lengthMessage);
  });

  it("error, structure component", () => {
    expect(errors(`TYPES: BEGIN OF ts,
         a TYPE t LENGTH 6,
       END OF ts.`)).to.equal(lengthMessage);
  });

  it("ok, LENGTH with c, n, x and p, DECIMALS with p", () => {
    expect(errors(`DATA a TYPE p LENGTH 8 DECIMALS 2.
DATA b TYPE p DECIMALS 2.
DATA c1 TYPE c LENGTH 5.
DATA n1 TYPE n LENGTH 5.
DATA x1 TYPE x LENGTH 5.
DATA p2 TYPE p VALUE 3 DECIMALS 0 LENGTH 4.
CONSTANTS k TYPE x LENGTH 2 VALUE 'FFFF'.
TYPES ty TYPE p LENGTH 16 DECIMALS 14.
FORM f.
  STATICS st TYPE n LENGTH 4.
ENDFORM.
TYPES: BEGIN OF ts,
         a TYPE p LENGTH 4 DECIMALS 1,
         b TYPE c LENGTH 3,
       END OF ts.`)).to.equal(undefined);
  });

  it("ok, LIKE has its own rules, not checked", () => {
    expect(errors(`DATA c1 TYPE c LENGTH 5.
DATA c2 LIKE c1 LENGTH 3.`)).to.equal(undefined);
  });

});
