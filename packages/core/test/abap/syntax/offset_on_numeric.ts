import {expect} from "chai";
import {runProgram} from "./syntax";
import {LanguageVersion, Release} from "../../../src/version";

const message = (type: string) => `Field type "${type}" does not permit substrings to be accessed`;

describe("syntax.ts, offset or length on a numeric field", () => {
  const program = (code: string): string => `
TYPES: BEGIN OF ty_struc,
         num  TYPE i,
         text TYPE c LENGTH 10,
       END OF ty_struc.
TYPES: BEGIN OF ty_char,
         a TYPE c LENGTH 2,
         b TYPE n LENGTH 4,
       END OF ty_char.
DATA lv_int TYPE i.
DATA lv_int8 TYPE int8.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA lv_f TYPE f.
DATA lv_df16 TYPE decfloat16.
DATA lv_df34 TYPE decfloat34.
DATA lv_c TYPE c LENGTH 10.
DATA lv_n TYPE n LENGTH 8.
DATA lv_d TYPE d.
DATA lv_t TYPE t.
DATA lv_s TYPE string.
DATA lv_x TYPE x LENGTH 4.
DATA lv_xs TYPE xstring.
DATA ls_struc TYPE ty_struc.
DATA ls_char TYPE ty_char.
DATA lr_int TYPE REF TO i.
DATA lv_off TYPE i VALUE 1.
DATA lv_result TYPE string.
FIELD-SYMBOLS <lv_any> TYPE any.
FIELD-SYMBOLS <lv_int> TYPE i.
FIELD-SYMBOLS <ls_struc> TYPE ty_struc.
${code}
FORM generic USING iv_any TYPE any iv_simple TYPE simple.
  iv_any+1(2) = '01'.
  lv_result = iv_simple+1(2).
ENDFORM.
`;

  const errors: {abap: string, type: string}[] = [
    {abap: `lv_int+1(2) = '01'.`, type: "I"},
    {abap: `lv_int+1 = '01'.`, type: "I"},
    {abap: `lv_int(2) = '01'.`, type: "I"},
    {abap: `lv_int+lv_off(2) = '01'.`, type: "I"},
    {abap: `lv_int8+1(2) = '01'.`, type: "8"},
    {abap: `lv_p+1(2) = '01'.`, type: "P"},
    {abap: `lv_f+1(2) = '01'.`, type: "F"},
    {abap: `lv_df16+1(2) = '01'.`, type: "a"},
    {abap: `lv_df34+1(2) = '01'.`, type: "e"},
    {abap: `ls_struc-num+1(2) = '01'.`, type: "I"},
    {abap: `<ls_struc>-num+1(2) = '01'.`, type: "I"},
    {abap: `lr_int->*+1(2) = '01'.`, type: "I"},
    {abap: `CLEAR lv_int+1(2).`, type: "I"},
    {abap: `CONCATENATE 'A' 'B' INTO lv_int+1(2).`, type: "I"},
    {abap: `lv_result = lv_int+1(2).`, type: "I"},
    {abap: `lv_result = lv_p(2).`, type: "P"},
    {abap: `lv_result = ls_struc-num+1(2).`, type: "I"},
    {abap: `WRITE lv_int+1(2).`, type: "I"},
    {abap: `IF lv_int+1(2) = '01'. ENDIF.`, type: "I"},
  ];

  for (const e of errors) {
    it("error: " + e.abap, () => {
      const issues = runProgram(program(e.abap));
      expect(issues.map(i => i.getMessage())).to.deep.equal([message(e.type)]);
    });
  }

  it("error, Cloud", () => {
    const issues = runProgram(program(`lv_int+1(2) = '01'.`), [], Release.Newest, undefined, LanguageVersion.Cloud);
    expect(issues.map(i => i.getMessage())).to.include(message("I"));
  });

  it("error, v702", () => {
    const issues = runProgram(`DATA lv_int TYPE i.
lv_int+1(2) = '01'.`, [], Release.v702);
    expect(issues.map(i => i.getMessage())).to.deep.equal([message("I")]);
  });

  const ok: string[] = [
    `lv_c+1(2) = '01'.`,
    `lv_n+1(2) = '01'.`,
    `lv_d+6(2) = '01'.`,
    `lv_t+2(2) = '01'.`,
    `lv_x+1(2) = 'FFFF'.`,
    `lv_result = lv_s+1(2).`,
    `lv_result = lv_xs+1(2).`,
    `ls_struc-text+1(2) = '01'.`,
    `ls_char+1(2) = '01'.`,
    `lv_result = ls_char+2(4).`,
    `ASSIGN lv_c TO <lv_any>. <lv_any>+1(2) = '01'.`,
    `lv_result = <lv_any>+1(2).`,
    `lv_int = lv_c+1(2).`,
    `lv_int = lv_d+6(2).`,
    `lv_c+lv_int(2) = '01'.`,
  ];

  for (const abap of ok) {
    it("ok: " + abap, () => {
      const issues = runProgram(program(abap));
      expect(issues.map(i => i.getMessage())).to.deep.equal([]);
    });
  }
});
