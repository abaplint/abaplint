import {expect} from "chai";
import {runProgram} from "./syntax";

const program = (body: string): string => `
REPORT zretry.
DATA n TYPE i.
START-OF-SELECTION.
${body}`;

describe("syntax.ts, RETRY", () => {
  const retry = "RETRY is only allowed in a CATCH block";

  const errors: [string, string][] = [
    ["outside a TRY", `RETRY.`],
    ["in a TRY block", `TRY.
  RETRY.
CATCH cx_root.
ENDTRY.`],
    ["in a CLEANUP block", `TRY.
  n = 1.
CLEANUP.
  RETRY.
ENDTRY.`],
    ["in a TRY block nested in a CATCH block", `TRY.
CATCH cx_root.
  TRY.
    RETRY.
  CATCH cx_root.
  ENDTRY.
ENDTRY.`],
    ["in a CLEANUP block nested in a CATCH block", `TRY.
CATCH cx_root.
  TRY.
  CLEANUP.
    RETRY.
  ENDTRY.
ENDTRY.`],
    ["after the TRY", `TRY.
CATCH cx_root.
ENDTRY.
RETRY.`],
  ];
  for (const [name, body] of errors) {
    it("error, " + name, () => {
      const issues = runProgram(program(body));
      expect(issues.length).to.equal(1);
      expect(issues[0].getMessage()).to.equal(retry);
    });
  }

  const ok: [string, string][] = [
    ["in a CATCH block", `TRY.
CATCH cx_root.
  RETRY.
ENDTRY.`],
    ["in a loop and a branch in a CATCH block", `TRY.
CATCH cx_root.
  DO 2 TIMES.
    IF n = 1.
      RETRY.
    ENDIF.
  ENDDO.
ENDTRY.`],
    ["in a CATCH block after a nested TRY", `TRY.
CATCH cx_root.
  TRY.
  CATCH cx_root.
  ENDTRY.
  RETRY.
ENDTRY.`],
    ["in a CATCH block nested in a TRY block", `TRY.
  TRY.
  CATCH cx_root.
    RETRY.
  ENDTRY.
CATCH cx_root.
ENDTRY.`],
    ["in a CATCH BEFORE UNWIND block", `TRY.
CATCH BEFORE UNWIND cx_root.
  RETRY.
ENDTRY.`],
  ];
  for (const [name, body] of ok) {
    it("ok, " + name, () => {
      const issues = runProgram(program(body));
      expect(issues.length).to.equal(0);
    });
  }
});
