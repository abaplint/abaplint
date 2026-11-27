import {expect} from "chai";
import {runProgram} from "./syntax";

describe("syntax.ts, substring of length 0", () => {
  const message = "Substring length must be greater than 0";

  const program = (code: string): string => `
TYPES: BEGIN OF ty_struc,
         comp TYPE c LENGTH 5,
       END OF ty_struc.
DATA c TYPE c LENGTH 30.
DATA n TYPE n LENGTH 4.
DATA x TYPE x LENGTH 4.
DATA d TYPE d.
DATA t TYPE t.
DATA s TYPE string.
DATA xs TYPE xstring.
DATA off TYPE i.
DATA ls TYPE ty_struc.
DATA rc TYPE REF TO ty_struc.
DATA rs TYPE REF TO string.
DATA rd TYPE REF TO data.
FIELD-SYMBOLS <c> TYPE c.
FIELD-SYMBOLS <x> TYPE x.
FIELD-SYMBOLS <n> TYPE n.
FIELD-SYMBOLS <clike> TYPE clike.
FIELD-SYMBOLS <any> TYPE any.
${code}`;

  const messages = (abap: string) => runProgram(abap).map(i => i.getMessage());

  const errors = [
    `s = c+1(0).`,
    `s = c(0).`,
    `s = c(00).`,
    `s = c+off(0).`,
    `s = n+1(0).`,
    `s = x+1(0).`,
    `s = d+2(0).`,
    `s = t(0).`,
    `s = ls(0).`,
    `s = ls-comp(0).`,
    `s = rc->comp+1(0).`,
    `s = <c>(0).`,
    `s = <x>+1(0).`,
    `s = <n>(0).`,
    `s = <clike>(0).`,
    `s = |{ c(0) }|.`,
    `IF c(0) = space. ENDIF.`,
    `c+1(0) = 'a'.`,
    `c(0) = 'a'.`,
    `<c>(0) = 'a'.`,
    `CLEAR c(0).`,
    `CONCATENATE 'a' 'b' INTO c+1(0).`,
    `CONDENSE c+1(0).`,
    `WRITE c+1(0).`,
    `WRITE c+1(0) TO c.`,
    `GET REFERENCE OF c+1(0) INTO rd.`,
    `ASSIGN COMPONENT 1 OF STRUCTURE c(0) TO <any>.`,
  ];

  for (const code of errors) {
    it(`error, ${code}`, () => {
      expect(messages(program(code))).to.deep.equal([message]);
    });
  }

  const valid = [
    `s = s+1(0).`,
    `s = s(0).`,
    `xs = xs+0(0).`,
    `s = rs->*(0).`,
    `s = <any>(0).`,
    `ASSIGN c(0) TO <any>.`,
    `ASSIGN c+1(0) TO <any>.`,
    `ASSIGN c+off(0) TO <any>.`,
    `ASSIGN <c>+1(0) TO <any>.`,
    `ASSIGN n+1(0) TO <any> CASTING TYPE c.`,
    `ASSIGN ls-comp+1(0) TO <any> RANGE ls.`,
    `WRITE 'a' TO c+1(0).`,
    `WRITE 'a' TO c+off(0).`,
    `WRITE sy-datum TO <c>(0).`,
    `s = c+1(*).`,
    `s = c+0(10).`,
  ];

  for (const code of valid) {
    it(`ok, ${code}`, () => {
      expect(messages(program(code))).to.deep.equal([]);
    });
  }

  it("error, generically typed parameters", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run IMPORTING c TYPE c n TYPE n x TYPE x cs TYPE csequence xs TYPE xsequence si TYPE simple.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA s TYPE string.
    s = c(0).
    s = n(0).
    s = x(0).
    s = cs(0).
    s = xs(0).
    s = si(0).
  ENDMETHOD.
ENDCLASS.`;
    expect(messages(abap)).to.deep.equal([message, message, message, message, message, message]);
  });

  it("error, method argument inside the source of ASSIGN", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS get IMPORTING val TYPE clike RETURNING VALUE(ref) TYPE REF TO data.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
ENDCLASS.

DATA c TYPE c LENGTH 30.
FIELD-SYMBOLS <any> TYPE any.
ASSIGN lcl=>get( c(0) )->* TO <any>.`;
    expect(messages(abap)).to.deep.equal([message]);
  });
});
