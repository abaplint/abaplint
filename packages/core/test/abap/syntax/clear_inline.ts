import {expect} from "chai";
import {runProgram} from "./syntax";

describe("syntax.ts, CLEAR and FREE with an inline declaration", () => {
  const program = (statement: string): string => `
DATA lv_value TYPE i.
DATA lt_tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.
FIELD-SYMBOLS <ls_any> TYPE any.
${statement}`;

  const expectError = (statement: string, message: string) => {
    const issues = runProgram(program(statement));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal(message);
  };

  const expectOk = (statement: string) => {
    const issues = runProgram(program(statement));
    expect(issues.length).to.equal(0, issues[0]?.getMessage());
  };

  it("error, CLEAR DATA( ), issue #1191", () => {
    expectError(`CLEAR DATA(sdf).`, `Inline declaration "DATA(sdf)" not possible in CLEAR`);
  });

  it("error, CLEAR FINAL( )", () => {
    expectError(`CLEAR FINAL(sdf).`, `Inline declaration "FINAL(sdf)" not possible in CLEAR`);
  });

  it("error, CLEAR FIELD-SYMBOL( )", () => {
    expectError(`CLEAR FIELD-SYMBOL(<sdf>).`, `Inline declaration "FIELD-SYMBOL(<sdf>)" not possible in CLEAR`);
  });

  it("error, CLEAR DATA( ) WITH", () => {
    expectError(`CLEAR DATA(sdf) WITH 'A'.`, `Inline declaration "DATA(sdf)" not possible in CLEAR`);
  });

  it("error, FREE DATA( )", () => {
    expectError(`FREE DATA(sdf).`, `Inline declaration "DATA(sdf)" not possible in FREE`);
  });

  it("error, FREE FIELD-SYMBOL( )", () => {
    expectError(`FREE FIELD-SYMBOL(<sdf>).`, `Inline declaration "FIELD-SYMBOL(<sdf>)" not possible in FREE`);
  });

  it("ok, CLEAR and FREE of declared variables", () => {
    expectOk(`CLEAR lv_value.
CLEAR <ls_any>.
FREE lt_tab.
FREE <ls_any>.`);
  });
});
