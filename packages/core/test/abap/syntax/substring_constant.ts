import {expect} from "chai";
import {runProgram} from "./syntax";

describe("syntax.ts, offset and length given by a constant", () => {
  const program = (code: string): string => `
TYPES: BEGIN OF ty_mixed,
         c TYPE c LENGTH 5,
         i TYPE i,
       END OF ty_mixed.
CONSTANTS lc_zero TYPE i VALUE 0.
CONSTANTS lc_one TYPE i VALUE 1.
CONSTANTS lc_two TYPE i VALUE 2.
CONSTANTS lc_four TYPE i VALUE 4.
CONSTANTS lc_big TYPE i VALUE 40.
CONSTANTS: BEGIN OF lc_struc,
             len TYPE i VALUE 40,
             BEGIN OF Inner,
               Len TYPE i VALUE 41,
             END OF Inner,
           END OF lc_struc.
DATA lv_c30 TYPE c LENGTH 30.
DATA lv_i TYPE i.
DATA lv_off TYPE i.
DATA lv_s TYPE string.
DATA ls_mixed TYPE ty_mixed.
FIELD-SYMBOLS <lv_c> TYPE c.
FIELD-SYMBOLS <lv_any> TYPE any.
${code}`;

  const run = (code: string) => runProgram(program(code)).map(i => i.getMessage());

  it("error, offset beyond the field", () => {
    expect(run(`lv_s = lv_c30+lc_big.`)).to.deep.equal(["Offset 40 is outside the field of length 30"]);
  });

  it("error, offset beyond the field, target", () => {
    expect(run(`lv_c30+lc_big = 'a'.`)).to.deep.equal(["Offset 40 is outside the field of length 30"]);
  });

  it("error, length beyond the field", () => {
    expect(run(`lv_s = lv_c30(lc_big).`)).to.deep.equal(["Length 40 exceeds the remaining length 30 of the field"]);
  });

  it("error, length beyond the rest of the field", () => {
    expect(run(`lv_s = lv_c30+29(lc_two).`)).to.deep.equal(["Length 2 exceeds the remaining length 1 of the field"]);
  });

  it("error, component of a constant", () => {
    expect(run(`lv_s = lv_c30(lc_struc-len).`)).to.deep.equal(["Length 40 exceeds the remaining length 30 of the field"]);
  });

  it("error, component of a nested constant, other case", () => {
    expect(run(`lv_s = lv_c30(LC_STRUC-INNER-LEN).`)).to.deep.equal(["Length 41 exceeds the remaining length 30 of the field"]);
  });

  it("error, length 0", () => {
    expect(run(`lv_s = lv_c30(lc_zero).`)).to.deep.equal(["Substring length must be greater than 0"]);
  });

  it("error, length 0, variable offset", () => {
    expect(run(`lv_s = lv_c30+lv_off(lc_zero).`)).to.deep.equal(["Substring length must be greater than 0"]);
  });

  it("error, offset and length on a numeric field which do not take the whole field", () => {
    expect(run(`lv_s = lv_i(lc_two).`)).to.deep.equal([`Field type "I" does not permit substrings to be accessed`]);
  });

  it("error, structure with a character-like initial part", () => {
    expect(run(`lv_s = ls_mixed(lc_big).`)).to.deep.equal(
      ["Length 40 exceeds the character-like initial part of length 5 of the structure"]);
  });

  it("error, structure with a character-like initial part, variable offset", () => {
    expect(run(`lv_s = ls_mixed+lv_off(lc_big).`)).to.deep.equal(
      ["Length 40 exceeds the character-like initial part of length 5 of the structure"]);
  });

  it("error, the offset gives the type of an inline declaration", () => {
    expect(run(`DATA(lv_rest) = lv_c30+lc_two.
lv_s = lv_rest+28.`)).to.deep.equal(["Offset 28 is outside the field of length 28"]);
  });

  it("ok, inside the field", () => {
    expect(run(`lv_s = lv_c30+lc_two(lc_four).
lv_c30+lc_zero(lc_two) = 'ab'.
lv_s = lv_s(lc_zero).
lv_s = ls_mixed+lc_one(lc_four).`)).to.deep.equal([]);
  });

  it("ok, the whole numeric field", () => {
    expect(run(`lv_s = lv_i+lc_zero.
lv_s = lv_i+lc_zero(lc_four).`)).to.deep.equal([]);
  });

  it("ok, variable offset, constant length beyond the field", () => {
    expect(run(`lv_s = lv_c30+lv_off(lc_big).`)).to.deep.equal([]);
  });

  it("ok, length 0 in ASSIGN and WRITE TO", () => {
    expect(run(`ASSIGN lv_c30+1(lc_zero) TO <lv_any>.
WRITE 'a' TO lv_c30(lc_zero).`)).to.deep.equal([]);
  });

  it("ok, generic field symbol", () => {
    expect(run(`<lv_c>+lc_big = 'a'.`)).to.deep.equal([]);
  });

  it("character-like and packed constants", () => {
    for (const type of [`c LENGTH 2 VALUE '40'`, `n LENGTH 3 VALUE '040'`, "string VALUE `40`",
      `p LENGTH 4 DECIMALS 0 VALUE 40`, `int8 VALUE 40`, `i VALUE '40'`]) {
      expect(run(`CONSTANTS lc TYPE ${type}.
lv_s = lv_c30+lc.`), type).to.deep.equal(["Offset 40 is outside the field of length 30"]);
    }
  });

  it("ok, value of a constant which is not read as a number", () => {
    for (const type of [`x LENGTH 1 VALUE '28'`, `p LENGTH 4 DECIMALS 1 VALUE '4.0'`, `c LENGTH 1 VALUE '40'`,
      `i VALUE IS INITIAL`]) {
      expect(run(`CONSTANTS lc TYPE ${type}.
lv_s = lv_c30+lc.`), type).to.deep.equal([]);
    }
  });

  it("class and interface constants", () => {
    const abap = `
INTERFACE lif.
  CONSTANTS big TYPE i VALUE 40.
ENDINTERFACE.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
    CONSTANTS zero TYPE i VALUE 0.
    CONSTANTS: BEGIN OF outer,
                 len TYPE i VALUE 41,
               END OF outer.
    METHODS run.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD run.
    CONSTANTS local TYPE i VALUE 42.
    DATA lv_c30 TYPE c LENGTH 30.
    DATA lv_s TYPE string.
    lv_s = lv_c30(zero).
    lv_s = lv_c30(outer-len).
    lv_s = lv_c30(lif~big).
    lv_s = lv_c30(local).
  ENDMETHOD.
ENDCLASS.

DATA lv_c30 TYPE c LENGTH 30.
DATA lv_s TYPE string.
lv_s = lv_c30(lcl=>zero).
lv_s = lv_c30(lcl=>outer-len).
lv_s = lv_c30(lcl=>lif~big).
lv_s = lv_c30(lif=>big).`;
    expect(runProgram(abap).map(i => i.getMessage())).to.deep.equal([
      "Substring length must be greater than 0",
      "Length 41 exceeds the remaining length 30 of the field",
      "Length 40 exceeds the remaining length 30 of the field",
      "Length 42 exceeds the remaining length 30 of the field",
      "Substring length must be greater than 0",
      "Length 41 exceeds the remaining length 30 of the field",
      "Length 40 exceeds the remaining length 30 of the field",
      "Length 40 exceeds the remaining length 30 of the field"]);
  });

  it("ok, read-only static attribute with a value", () => {
    const abap = `
INTERFACE lif.
  CLASS-DATA big TYPE i READ-ONLY.
ENDINTERFACE.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
    CLASS-DATA ro TYPE i READ-ONLY VALUE 40.
    METHODS run.
    CLASS-METHODS stat.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA lv_c30 TYPE c LENGTH 30.
    DATA lv_s TYPE string.
    lv_s = lv_c30+ro.
    lv_s = lv_c30+lif~big.
  ENDMETHOD.

  METHOD stat.
    DATA lv_c30 TYPE c LENGTH 30.
    DATA lv_s TYPE string.
    lv_s = lv_c30+ro.
  ENDMETHOD.
ENDCLASS.

DATA lv_c30 TYPE c LENGTH 30.
DATA lv_s TYPE string.
lv_s = lv_c30+lcl=>ro.
lv_s = lv_c30+lif=>big.`;
    expect(runProgram(abap).map(i => i.getMessage())).to.deep.equal([]);
  });

});
