import {expect} from "chai";
import {runProgram} from "./syntax";

function run(abap: string): string[] {
  return runProgram(abap).map(i => i.getMessage());
}

describe("syntax.ts, character-like initial part of a structure", () => {
  const program = (code: string): string => `
TYPES: BEGIN OF ty_row,
         keyf TYPE c LENGTH 10,
         ts   TYPE utclong,
       END OF ty_row.
TYPES: BEGIN OF ty_hex,
         n   TYPE n LENGTH 4,
         d   TYPE d,
         t   TYPE t,
         hex TYPE x LENGTH 2,
       END OF ty_hex.
TYPES: BEGIN OF ty_nested,
         BEGIN OF sub,
           a TYPE c LENGTH 4,
         END OF sub,
         b  TYPE c LENGTH 4,
         ts TYPE utclong,
       END OF ty_nested.
TYPES: BEGIN OF ty_gap,
         a TYPE c LENGTH 3,
         BEGIN OF sub,
           b  TYPE c LENGTH 3,
           ts TYPE utclong,
         END OF sub,
       END OF ty_gap.
TYPES: BEGIN OF ty_deep,
         keyf TYPE c LENGTH 10,
         str  TYPE string,
       END OF ty_deep.
TYPES ty_c3 TYPE c LENGTH 3.
TYPES ty_c6 TYPE c LENGTH 6.
TYPES ty_c8 TYPE c LENGTH 8.
TYPES ty_c10 TYPE c LENGTH 10.
TYPES ty_c11 TYPE c LENGTH 11.
TYPES ty_c18 TYPE c LENGTH 18.
TYPES ty_c19 TYPE c LENGTH 19.
DATA row TYPE ty_row.
DATA hex TYPE ty_hex.
DATA nested TYPE ty_nested.
DATA gap TYPE ty_gap.
DATA deep TYPE ty_deep.
DATA c3 TYPE ty_c3.
DATA c6 TYPE ty_c6.
DATA c8 TYPE ty_c8.
DATA c10 TYPE ty_c10.
DATA c11 TYPE ty_c11.
DATA c18 TYPE ty_c18.
DATA c19 TYPE ty_c19.
DATA d TYPE d.
DATA s TYPE string.
DATA off TYPE i.
DATA tab TYPE STANDARD TABLE OF ty_c10 WITH EMPTY KEY.
FIELD-SYMBOLS <row> TYPE ty_row.
${code}`;

  const ok: string[] = [
    `c10 = row.`,
    `c3 = row.`,
    `MOVE row TO c10.`,
    `row = c10.`,
    `row = 'abc'.`,
    `c10 = CONV #( row ).`,
    `APPEND row TO tab.`,
    `c18 = hex.`,
    `hex = c18.`,
    `c8 = nested.`,
    `nested = c8.`,
    `c3 = gap.`,
    `s = row+0(5).`,
    `s = row(10).`,
    `s = row+9(1).`,
    `s = row+off.`,
    `s = row+off(5).`,
    `s = row+0(off).`,
    `s = row+0.`,
    `s = row+off(10).`,
    `s = row(off).`,
    `s = row+off(off).`,
    `s = nested+4(4).`,
    `row+0(5) = 'a'.`,
    `row+0(5) = s.`,
    `row(10) = c10.`,
    `ASSIGN row TO <row>. s = <row>+0(5).`,
    `ASSIGN row TO <row>. <row>+0(5) = s.`,
  ];

  for (const abap of ok) {
    it("ok: " + abap, () => {
      expect(run(program(abap))).to.deep.equal([]);
    });
  }

  const errors: string[] = [
    `c11 = row.`,
    `row = c11.`,
    `c19 = hex.`,
    `c6 = gap.`,
    `c10 = deep.`,
    `s = row.`,
    `d = c10. row = d.`,
    `s = row+5.`,
    `s = row+5(6).`,
    `s = row(11).`,
    `s = row+10(1).`,
    `s = row(*).`,
    `c10 = row+5.`,
    `c10 = row+20(2).`,
    `c10 = row+10(1).`,
    `c10 = row+20(off).`,
    `c10 = row+off(20).`,
    `c10 = row(11).`,
    `row+5 = 'a'.`,
    `row+20(2) = 'a'.`,
    `row+5(6) = 'a'.`,
    `row(11) = 'a'.`,
    `ASSIGN row+10(8) TO FIELD-SYMBOL(<any>).`,
    `ASSIGN row TO <row>. c10 = <row>+20(2).`,
  ];

  for (const abap of errors) {
    it("error: " + abap, () => {
      expect(run(program(abap)).length).to.be.greaterThan(0);
    });
  }
});
