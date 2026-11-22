import {expect} from "chai";
import {runProgram} from "./syntax";

describe("syntax.ts, CONTINUE outside of loops, #3660", () => {
  const message = "CONTINUE can only be used in loops";

  it("error, CONTINUE inside IF without a loop", () => {
    const issues = runProgram(`
DATA a TYPE i.
IF a = 1.
  CONTINUE.
ENDIF.`);
    expect(issues.length).to.equal(1);
    expect(issues[0]?.getMessage()).to.equal(message);
  });

  it("error, CONTINUE inside CASE without a loop", () => {
    const issues = runProgram(`
CASE abap_true.
  WHEN 'X'.
    WRITE 'X'.
  WHEN OTHERS.
    CONTINUE.
ENDCASE.`);
    expect(issues.length).to.equal(1);
    expect(issues[0]?.getMessage()).to.equal(message);
  });

  it("error, CONTINUE in a FORM called from a loop", () => {
    const issues = runProgram(`
DO 2 TIMES.
  PERFORM foo.
ENDDO.
FORM foo.
  CONTINUE.
ENDFORM.`);
    expect(issues.length).to.equal(1);
    expect(issues[0]?.getMessage()).to.equal(message);
  });

  it("error, CONTINUE in a method, after the loop", () => {
    const issues = runProgram(`
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    DO 2 TIMES.
    ENDDO.
    CONTINUE.
  ENDMETHOD.
ENDCLASS.`);
    expect(issues.length).to.equal(1);
    expect(issues[0]?.getMessage()).to.equal(message);
  });

  it("error, CONTINUE in a CLEANUP block without a loop, reported once", () => {
    const issues = runProgram(`
FORM foo.
  TRY.
      WRITE 'X'.
    CLEANUP.
      CONTINUE.
  ENDTRY.
ENDFORM.`);
    expect(issues.length).to.equal(1);
    expect(issues[0]?.getMessage()).to.equal(message);
  });

  it("ok, CONTINUE in LOOP, DO, WHILE and SELECT loops", () => {
    const issues = runProgram(`
DATA tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.
DATA a TYPE i.
LOOP AT tab INTO a.
  IF a = 1.
    CONTINUE.
  ENDIF.
ENDLOOP.
DO 2 TIMES.
  CASE a.
    WHEN 1.
      CONTINUE.
  ENDCASE.
ENDDO.
WHILE a < 5.
  a = a + 1.
  CONTINUE.
ENDWHILE.
SELECT carrid FROM scarr INTO @DATA(lv_carrid).
  CONTINUE.
ENDSELECT.
LOOP AT SCREEN.
  CONTINUE.
ENDLOOP.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, CONTINUE in a CATCH block inside a loop", () => {
    const issues = runProgram(`
DO 2 TIMES.
  TRY.
      WRITE 'X'.
    CATCH cx_root.
      CONTINUE.
  ENDTRY.
ENDDO.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, CONTINUE from a macro used in a loop", () => {
    const issues = runProgram(`
DEFINE _next.
  CONTINUE.
END-OF-DEFINITION.
DO 2 TIMES.
  _next.
ENDDO.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, EXIT and CHECK outside of loops are not changed", () => {
    const issues = runProgram(`
FORM foo.
  DATA a TYPE i.
  CHECK a = 1.
  EXIT.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });
});
