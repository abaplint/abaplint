import {expect} from "chai";
import {runProgram} from "./syntax";

describe("syntax.ts, static offset and length outside the field", () => {
  const program = (code: string): string => `
TYPES ty_c5 TYPE c LENGTH 5.
TYPES: BEGIN OF ty_struc,
         comp TYPE ty_c5,
       END OF ty_struc.
DATA lv_c5 TYPE ty_c5.
DATA lv_c16 TYPE c LENGTH 16.
DATA lv_x4 TYPE x LENGTH 4.
DATA lv_n3 TYPE n LENGTH 3.
DATA lv_d TYPE d.
DATA lv_s TYPE string.
DATA ls_struc TYPE ty_struc.
DATA lr_c5 TYPE REF TO ty_c5.
DATA lv_off TYPE i.
DATA lv_result TYPE string.
FIELD-SYMBOLS <lv_c> TYPE c.
FIELD-SYMBOLS <lv_x> TYPE x.
FIELD-SYMBOLS <lv_any> TYPE any.
FIELD-SYMBOLS <ls_struc> TYPE ty_struc.
CONSTANTS lc_off TYPE i VALUE 6.
${code}`;

  it("error, target, offset and length beyond the field", () => {
    const issues = runProgram(program(`lv_c5+3(4) = 'ABCD'.`));
    expect(issues[0]?.getMessage()).to.equal("Length 4 exceeds the remaining length 2 of the field");
  });

  it("error, target, offset beyond the field", () => {
    const issues = runProgram(program(`lv_c5+6 = 'A'.`));
    expect(issues[0]?.getMessage()).to.equal("Offset 6 is outside the field of length 5");
  });

  it("error, target, offset equal to the length", () => {
    const issues = runProgram(program(`lv_c5+5 = 'A'.`));
    expect(issues[0]?.getMessage()).to.equal("Offset 5 is outside the field of length 5");
  });

  it("error, target, length beyond the field", () => {
    const issues = runProgram(program(`lv_c5(6) = 'ABCDEF'.`));
    expect(issues[0]?.getMessage()).to.equal("Length 6 exceeds the remaining length 5 of the field");
  });

  it("error, target, structure component", () => {
    const issues = runProgram(program(`ls_struc-comp+3(4) = 'ABCD'.`));
    expect(issues[0]?.getMessage()).to.equal("Length 4 exceeds the remaining length 2 of the field");
  });

  it("error, target, component of a field symbol", () => {
    const issues = runProgram(program(`<ls_struc>-comp+6 = 'A'.`));
    expect(issues[0]?.getMessage()).to.equal("Offset 6 is outside the field of length 5");
  });

  it("error, target, dereference", () => {
    const issues = runProgram(program(`lr_c5->*+6 = 'A'.`));
    expect(issues[0]?.getMessage()).to.equal("Offset 6 is outside the field of length 5");
  });

  it("error, target, byte field", () => {
    const issues = runProgram(program(`lv_x4+2(3) = 'FFFFFF'.`));
    expect(issues[0]?.getMessage()).to.equal("Length 3 exceeds the remaining length 2 of the field");
  });

  it("error, target of CONCATENATE", () => {
    const issues = runProgram(program(`CONCATENATE 'A' 'B' INTO lv_c5+4(2).`));
    expect(issues[0]?.getMessage()).to.equal("Length 2 exceeds the remaining length 1 of the field");
  });

  it("error, target of WRITE TO", () => {
    const issues = runProgram(program(`WRITE 'A' TO lv_c5+5.`));
    expect(issues[0]?.getMessage()).to.equal("Offset 5 is outside the field of length 5");
  });

  it("error, source, offset and length beyond the field", () => {
    const issues = runProgram(program(`lv_result = lv_c5+3(4).`));
    expect(issues[0]?.getMessage()).to.equal("Length 4 exceeds the remaining length 2 of the field");
  });

  it("error, source, offset equal to the length", () => {
    const issues = runProgram(program(`lv_result = lv_c5+5.`));
    expect(issues[0]?.getMessage()).to.equal("Offset 5 is outside the field of length 5");
  });

  it("error, source, ASSIGN with offset equal to the length and (*)", () => {
    const issues = runProgram(program(`ASSIGN lv_c5+5(*) TO <lv_any>.`));
    expect(issues[0]?.getMessage()).to.equal("Offset 5 is outside the field of length 5");
  });

  it("ok, target inside the field", () => {
    const issues = runProgram(program(`lv_c5+2(3) = 'ABC'.
lv_c5+4 = 'A'.
lv_c5(5) = 'ABCDE'.
lv_x4+2(2) = 'FFFF'.
lv_c16+11 = '+0000'.
CLEAR lv_c5+3(2).`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, source inside the field, (*) and length 0", () => {
    const issues = runProgram(program(`ASSIGN lv_c5+4(*) TO <lv_any>.
lv_result = lv_c5+2(3).
lv_result = lv_c5(0).`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, dynamic offset", () => {
    const issues = runProgram(program(`lv_c5+lv_off(4) = 'ABCD'.`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, offset given by a constant", () => {
    const issues = runProgram(program(`lv_c5+lc_off = 'A'.`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, numeric text, date", () => {
    const issues = runProgram(program(`lv_n3+3 = '1'.
lv_d+8 = '1'.
lv_result = lv_d+8.`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, generic field symbols", () => {
    const issues = runProgram(program(`<lv_c>+3(4) = 'ABCD'.
<lv_x>+3(2) = 'FFFF'.
lv_result = <lv_c>+3.`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, generic parameters", () => {
    const abap = `
FORM foo CHANGING cv TYPE c.
  cv+5 = 'A'.
ENDFORM.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run CHANGING cv TYPE c cx TYPE x.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD run.
    cv+5 = 'A'.
    cx+5(1) = 'FF'.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("string target keeps its own message", () => {
    const issues = runProgram(program(`lv_s+6 = 'A'.`));
    expect(issues[0]?.getMessage()).to.equal("xstring/string offset/length in writer position not possible");
  });
});
