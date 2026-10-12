import {expect} from "chai";
import {runProgram} from "./syntax";

describe("syntax.ts, statements that leave a CLEANUP block", () => {
  const program = (cleanup: string): string => `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA lt TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    DATA lv TYPE i.
    DO 2 TIMES.
      TRY.
          lv = 1.
        CLEANUP.
${cleanup}
      ENDTRY.
    ENDDO.
  ENDMETHOD.
ENDCLASS.`;

  it("error, RETURN", () => {
    const issues = runProgram(program(`RETURN.`));
    expect(issues[0]?.getMessage()).to.equal(`RETURN cannot leave a CLEANUP block`);
  });

  it("error, RETURN inside a loop in the CLEANUP block", () => {
    const issues = runProgram(program(`LOOP AT lt INTO lv.
  RETURN.
ENDLOOP.`));
    expect(issues[0]?.getMessage()).to.equal(`RETURN cannot leave a CLEANUP block`);
  });

  it("error, EXIT of the loop outside the TRY", () => {
    const issues = runProgram(program(`EXIT.`));
    expect(issues[0]?.getMessage()).to.equal(`EXIT cannot leave a CLEANUP block`);
  });

  it("error, CONTINUE of the loop outside the TRY, inside IF", () => {
    const issues = runProgram(program(`IF lv = 1.
  CONTINUE.
ENDIF.`));
    expect(issues[0]?.getMessage()).to.equal(`CONTINUE cannot leave a CLEANUP block`);
  });

  it("error, CHECK of the loop outside the TRY", () => {
    const issues = runProgram(program(`CHECK lv = 1.`));
    expect(issues[0]?.getMessage()).to.equal(`CHECK cannot leave a CLEANUP block`);
  });

  it("error, EXIT in a CATCH block of a TRY inside the CLEANUP block", () => {
    const issues = runProgram(program(`TRY.
    lv = 2.
  CATCH cx_root.
    EXIT.
ENDTRY.`));
    expect(issues[0]?.getMessage()).to.equal(`EXIT cannot leave a CLEANUP block`);
  });

  it("error, EXIT without any loop, leaves the FORM", () => {
    const issues = runProgram(`
FORM run.
  DATA lv TYPE i.
  TRY.
      lv = 1.
    CLEANUP.
      EXIT.
  ENDTRY.
ENDFORM.`);
    expect(issues[0]?.getMessage()).to.equal(`EXIT cannot leave a CLEANUP block`);
  });

  it("error, inner CLEANUP block reported once", () => {
    const issues = runProgram(program(`TRY.
    lv = 2.
  CLEANUP.
    RETURN.
ENDTRY.`));
    expect(issues.length).to.equal(1);
    expect(issues[0]?.getMessage()).to.equal(`RETURN cannot leave a CLEANUP block`);
  });

  it("ok, EXIT, CONTINUE and CHECK of loops inside the CLEANUP block", () => {
    const issues = runProgram(program(`DO 2 TIMES.
  EXIT.
ENDDO.
WHILE lv < 5.
  lv = lv + 1.
  CONTINUE.
ENDWHILE.
LOOP AT lt INTO lv.
  CHECK lv = 1.
  IF lv = 2.
    EXIT.
  ENDIF.
ENDLOOP.
SELECT carrid FROM scarr INTO @DATA(lv_carrid).
  EXIT.
ENDSELECT.`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, EXIT of a loop inside a TRY in the CLEANUP block", () => {
    const issues = runProgram(program(`TRY.
    DO 2 TIMES.
      EXIT.
    ENDDO.
  CATCH cx_root.
    lv = 3.
ENDTRY.`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, RETURN and EXIT in the TRY and CATCH blocks", () => {
    const issues = runProgram(`
FORM run.
  DATA lv TYPE i.
  DO 2 TIMES.
    TRY.
        lv = 1.
        EXIT.
      CATCH cx_root.
        CONTINUE.
      CLEANUP.
        lv = 2.
    ENDTRY.
  ENDDO.
  TRY.
      RETURN.
    CATCH cx_root.
      RETURN.
  ENDTRY.
ENDFORM.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, EXIT FROM STEP-LOOP is left alone", () => {
    const issues = runProgram(program(`EXIT FROM STEP-LOOP.`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });
});
