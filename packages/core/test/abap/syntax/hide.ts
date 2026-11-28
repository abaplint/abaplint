import {expect} from "chai";
import {runProgram} from "./syntax";

const program = (body: string): string => `
REPORT zhide.
TYPES: BEGIN OF ty_flat,
         a TYPE c LENGTH 1,
         b TYPE i,
       END OF ty_flat.
TYPES: BEGIN OF ty_deep,
         a TYPE c LENGTH 1,
         b TYPE string,
       END OF ty_deep.
DATA gv_row TYPE c LENGTH 1.
DATA gv_int TYPE i.
DATA gs_flat TYPE ty_flat.
DATA gs_deep TYPE ty_deep.
DATA gv_secret TYPE string.
DATA gv_xstr TYPE xstring.
DATA gt_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
DATA gr_ref TYPE REF TO i.
DATA go_obj TYPE REF TO object.
START-OF-SELECTION.
${body}`;

describe("syntax.ts, HIDE", () => {
  const errors: [string, string][] = [
    ["string", `HIDE gv_secret.`],
    ["xstring", `HIDE gv_xstr.`],
    ["table", `HIDE gt_tab.`],
    ["data reference", `HIDE gr_ref.`],
    ["object reference", `HIDE go_obj.`],
    ["structure containing a string", `HIDE gs_deep.`],
  ];
  for (const [name, body] of errors) {
    it("error, " + name, () => {
      const issues = runProgram(program(body));
      expect(issues.length).to.equal(1);
      expect(issues[0].getMessage()).to.contain("cannot be a table, a reference, a string");
    });
  }

  it("error, chained, one issue per deep field", () => {
    const issues = runProgram(program(`HIDE: gv_row, gv_secret, gt_tab.`));
    expect(issues.length).to.equal(2);
  });

  it("error, unknown field", () => {
    const issues = runProgram(program(`HIDE gv_unknown.`));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("not found");
  });

  const ok: [string, string][] = [
    ["character", `HIDE gv_row.`],
    ["integer", `HIDE gv_int.`],
    ["flat structure", `HIDE gs_flat.`],
    ["structure component", `HIDE gs_deep-a.`],
    ["chained", `HIDE: gv_row, gv_int.`],
    ["sy field", `HIDE sy-tabix.`],
  ];
  for (const [name, body] of ok) {
    it("ok, " + name, () => {
      const issues = runProgram(program(body));
      expect(issues.length).to.equal(0);
    });
  }
});
