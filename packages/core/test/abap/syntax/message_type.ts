import {expect} from "chai";
import {runProgram} from "./syntax";

describe("syntax.ts, MESSAGE with a statically known message type", () => {
  const program = (statement: string): string => `
CONSTANTS lc_valid TYPE c LENGTH 1 VALUE 'W'.
CONSTANTS lc_invalid TYPE c LENGTH 1 VALUE 'Q'.
CONSTANTS lc_short VALUE 'SX'.
DATA lv_total TYPE i.
DATA lv_type TYPE c LENGTH 1.
${statement}`;

  const expectError = (statement: string, value: string) => {
    const issues = runProgram(program(statement));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal(`Message type "${value}" is not valid, expected A, E, I, S, W or X`);
  };

  const expectOk = (statement: string) => {
    const issues = runProgram(program(statement));
    expect(issues.length).to.equal(0, issues[0]?.getMessage());
  };

  it("error, issue #450", () => {
    expectError(`MESSAGE |Grand Total: { lv_total }| TYPE 'S.'.`, "S.");
  });

  it("error, unknown letter", () => {
    expectError(`MESSAGE 'hello' TYPE 'Q'.`, "Q");
  });

  it("error, empty literal", () => {
    expectError(`MESSAGE 'hello' TYPE ''.`, "");
  });

  it("error, string literal", () => {
    expectError("MESSAGE 'hello' TYPE `SS`.", "SS");
  });

  it("error, constant", () => {
    expectError(`MESSAGE 'hello' TYPE lc_invalid.`, "Q");
  });

  it("error, DISPLAY LIKE", () => {
    expectError(`MESSAGE 'hello' TYPE 'S' DISPLAY LIKE 'F'.`, "F");
  });

  it("error, MESSAGE ID ... TYPE ... NUMBER", () => {
    expectError(`MESSAGE ID 'ZZ' TYPE 'Z' NUMBER '001'.`, "Z");
  });

  it("error, MESSAGE ID ... DISPLAY LIKE", () => {
    expectError(`MESSAGE ID 'ZZ' TYPE 'S' NUMBER '001' DISPLAY LIKE 'Y'.`, "Y");
  });

  it("ok, all valid types", () => {
    for (const type of ["A", "E", "I", "S", "W", "X"]) {
      expectOk(`MESSAGE 'hello' TYPE '${type}'.`);
    }
  });

  it("ok, lower case", () => {
    expectOk(`MESSAGE 'hello' TYPE 's'.`);
  });

  it("ok, trailing blank", () => {
    expectOk(`MESSAGE 'hello' TYPE 'E '.`);
  });

  it("ok, valid constant", () => {
    expectOk(`MESSAGE 'hello' TYPE lc_valid.`);
  });

  it("ok, constant value cut to its length", () => {
    expectOk(`MESSAGE 'hello' TYPE lc_short.`);
  });

  it("ok, variable", () => {
    expectOk(`MESSAGE 'hello' TYPE lv_type DISPLAY LIKE lv_type.`);
  });

  it("ok, MESSAGE ID with variable type", () => {
    expectOk(`MESSAGE ID sy-msgid TYPE sy-msgty NUMBER sy-msgno.`);
  });

  it("ok, short form", () => {
    expectOk(`MESSAGE s001(zz) DISPLAY LIKE 'E'.`);
  });
});
