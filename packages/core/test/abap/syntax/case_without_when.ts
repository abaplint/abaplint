import {expect} from "chai";
import {runProgram} from "./syntax";

describe("syntax.ts, WHEN must follow CASE directly in classes", () => {
  const method = (body: string, macros = ""): string => `
${macros}
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA a TYPE i.
${body}
  ENDMETHOD.
ENDCLASS.`;

  const expectError = (abap: string): void => {
    const issues = runProgram(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal(`CASE must be followed directly by WHEN`);
  };

  const expectNoError = (abap: string): void => {
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  };

  it("ok, WHEN", () => {
    expectNoError(method(`CASE a.
  WHEN 1.
    a = 2.
ENDCASE.`));
  });

  it("ok, only WHEN OTHERS", () => {
    expectNoError(method(`CASE a.
  WHEN OTHERS.
ENDCASE.`));
  });

  it("ok, comment, empty statement and extended check before WHEN", () => {
    expectNoError(method(`CASE a.
* comment
  " comment
  .
  SET EXTENDED CHECK OFF.
  WHEN 1.
ENDCASE.`));
  });

  it("error, no WHEN", () => {
    expectError(method(`CASE a.
ENDCASE.`));
  });

  it("error, no WHEN, only extended check", () => {
    expectError(method(`CASE a.
  SET EXTENDED CHECK OFF.
ENDCASE.`));
  });

  it("error, statement before the first WHEN", () => {
    expectError(method(`CASE a.
  a = 1.
  WHEN 1.
ENDCASE.`));
  });

  it("error, statements and no WHEN", () => {
    expectError(method(`CASE a.
  a = 1.
  a = 2.
ENDCASE.`));
  });

  it("error, control structure before the first WHEN", () => {
    expectError(method(`CASE a.
  IF a = 1.
  ENDIF.
  WHEN 1.
ENDCASE.`));
  });

  it("error, declaration before the first WHEN", () => {
    expectError(method(`CASE a.
  DATA b TYPE i.
  WHEN 1.
ENDCASE.`));
  });

  it("error, chained declaration before the first WHEN", () => {
    expectError(method(`CASE a.
  DATA: BEGIN OF b,
          c TYPE i,
        END OF b.
  WHEN 1.
ENDCASE.`));
  });

  it("error, macro definition before the first WHEN", () => {
    expectError(method(`CASE a.
  DEFINE mac.
  END-OF-DEFINITION.
  WHEN 1.
ENDCASE.`));
  });

  it("error, nested CASE without WHEN", () => {
    expectError(method(`CASE a.
  WHEN 1.
    CASE a.
    ENDCASE.
ENDCASE.`));
  });

  it("error, in a method of a global class", () => {
    expectError(`
CLASS zcl_foo DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.

CLASS zcl_foo IMPLEMENTATION.
  METHOD run.
    DATA a TYPE i.
    CASE a.
    ENDCASE.
  ENDMETHOD.
ENDCLASS.`);
  });

  it("ok, macro supplies the WHEN", () => {
    expectNoError(method(`CASE a.
  mac.
ENDCASE.`, `DEFINE mac.
  WHEN 1.
END-OF-DEFINITION.`));
  });

  it("ok, macro in front of WHEN", () => {
    expectNoError(method(`CASE a.
  mac.
  WHEN 1.
ENDCASE.`, `DEFINE mac.
END-OF-DEFINITION.`));
  });

  it("ok, include in front of WHEN is not looked into", () => {
    expectNoError(method(`CASE a.
  INCLUDE zfoo IF FOUND.
  WHEN 1.
ENDCASE.`));
  });

  it("ok, outside of classes only a warning, no WHEN", () => {
    expectNoError(`
DATA a TYPE i.
CASE a.
ENDCASE.`);
  });

  it("ok, outside of classes only a warning, statement before the first WHEN", () => {
    expectNoError(`
FORM run.
  DATA a TYPE i.
  CASE a.
    a = 1.
    WHEN 1.
  ENDCASE.
ENDFORM.`);
  });

  it("ok, program statements after a class", () => {
    expectNoError(method(`CASE a.
  WHEN 1.
ENDCASE.`) + `
START-OF-SELECTION.
  DATA b TYPE i.
  CASE b.
  ENDCASE.`);
  });
});
