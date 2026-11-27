import {expect} from "chai";
import {runProgram} from "./syntax";

const message = `Field type "utclong" does not permit substrings to be accessed`;

describe("syntax.ts, offset or length on a utclong", () => {
  const program = (code: string): string => `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-DATA attr TYPE utclong.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.
TYPES: BEGIN OF ty_struc,
         u TYPE utclong,
       END OF ty_struc.
DATA u TYPE utclong.
DATA u2 TYPE utclong.
DATA s TYPE string.
DATA off TYPE i.
DATA struc TYPE ty_struc.
DATA ref TYPE REF TO utclong.
DATA sref TYPE REF TO ty_struc.
FIELD-SYMBOLS <u> TYPE utclong.
${code}`;

  const errors: string[] = [
    `s = u+1(1).`,
    `s = u(1).`,
    `s = u+1.`,
    `s = u+1(*).`,
    `s = u+0(27).`,
    `s = u+off.`,
    `s = u(off).`,
    `u+1(1) = 'a'.`,
    `u(1) = 'a'.`,
    `u+off = 'a'.`,
    `u(off) = 'a'.`,
    `s = struc-u(1).`,
    `struc-u+1 = 'a'.`,
    `s = <u>+1.`,
    `s = <u>(1).`,
    `<u>+1 = 'a'.`,
    `<u>(1) = 'a'.`,
    `s = ref->*(1).`,
    `ref->*(1) = 'a'.`,
    `s = sref->u(1).`,
    `sref->u+1(1) = 'a'.`,
    `s = lcl=>attr(1).`,
    `lcl=>attr(1) = 'a'.`,
    `ASSIGN u+1(1) TO FIELD-SYMBOL(<f>).`,
    `CLEAR u(1).`,
    `IF u(1) = 'a'. ENDIF.`,
    `s = |{ u+1(1) }|.`,
  ];

  for (const abap of errors) {
    it("error: " + abap, () => {
      const issues = runProgram(program(abap));
      expect(issues.map(i => i.getMessage())).to.include(message);
    });
  }

  // the offset 0 and the length "*" take the whole field
  const ok: string[] = [
    `u2 = u+0.`,
    `u2 = u+00.`,
    `u2 = u(*).`,
    `u2 = u+0(*).`,
    `u+0 = u2.`,
    `u+0(*) = u2.`,
    `u2 = <u>+0(*).`,
  ];

  for (const abap of ok) {
    it("ok: " + abap, () => {
      const issues = runProgram(program(abap));
      expect(issues.map(i => i.getMessage())).to.deep.equal([]);
    });
  }
});
