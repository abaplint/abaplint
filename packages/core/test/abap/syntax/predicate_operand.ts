import {expect} from "chai";
import {runProgram} from "./syntax";
import {Release} from "../../../src/version";

describe("syntax.ts, predicate function as the operand of a comparison", () => {
  const program = (cond: string): string => `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS get_flag RETURNING VALUE(r) TYPE abap_bool.
    METHODS run.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get_flag.
  ENDMETHOD.
  METHOD run.
    DATA lv TYPE string.
    DATA lt TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    IF ${cond}.
    ENDIF.
  ENDMETHOD.
ENDCLASS.`;

  it("error, contains( ) = abap_true", () => {
    const issues = runProgram(program(`contains( val = lv start = \` \` ) = abap_true`));
    expect(issues[0]?.getMessage()).to.equal(`Predicate function "contains" cannot be the operand of a comparison`);
  });

  it("error, abap_true = contains( ), right operand", () => {
    const issues = runProgram(program(`abap_true = contains( val = lv sub = \`a\` )`));
    expect(issues[0]?.getMessage()).to.equal(`Predicate function "contains" cannot be the operand of a comparison`);
  });

  it("error, second comparison after OR", () => {
    const issues = runProgram(program(`lv IS INITIAL OR contains( val = lv end = \` \` ) = abap_true`));
    expect(issues[0]?.getMessage()).to.equal(`Predicate function "contains" cannot be the operand of a comparison`);
  });

  it("error, CONTAINS( ) upper case", () => {
    const issues = runProgram(program(`CONTAINS( val = lv sub = \`a\` ) EQ abap_true`));
    expect(issues[0]?.getMessage()).to.equal(`Predicate function "CONTAINS" cannot be the operand of a comparison`);
  });

  it("error, contains_any_of( ) <> abap_false", () => {
    const issues = runProgram(program(`contains_any_of( val = lv sub = \`ab\` ) <> abap_false`));
    expect(issues[0]?.getMessage()).to.equal(`Predicate function "contains_any_of" cannot be the operand of a comparison`);
  });

  it("error, contains_any_not_of( ) = abap_true", () => {
    const issues = runProgram(program(`contains_any_not_of( val = lv sub = \`ab\` ) = abap_true`));
    expect(issues[0]?.getMessage()).to.equal(`Predicate function "contains_any_not_of" cannot be the operand of a comparison`);
  });

  it("error, matches( ) = abap_true", () => {
    const issues = runProgram(program(`matches( val = lv regex = \`a+\` ) = abap_true`));
    expect(issues[0]?.getMessage()).to.equal(`Predicate function "matches" cannot be the operand of a comparison`);
  });

  it("error, line_exists( ) = abap_true", () => {
    const issues = runProgram(program(`line_exists( lt[ table_line = \`a\` ] ) = abap_true`));
    expect(issues[0]?.getMessage()).to.equal(`Predicate function "line_exists" cannot be the operand of a comparison`);
  });

  it("ok, contains( ) standing alone", () => {
    const issues = runProgram(program(`contains( val = lv start = \` \` )`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, NOT line_exists( ) standing alone", () => {
    const issues = runProgram(program(`NOT line_exists( lt[ table_line = \`a\` ] )`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, boolc( contains( ) ) = abap_true", () => {
    const issues = runProgram(program(`boolc( contains( val = lv start = \` \` ) ) = abap_true`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, xsdbool( matches( ) ) = abap_true", () => {
    const issues = runProgram(program(`xsdbool( matches( val = lv regex = \`a+\` ) ) = abap_true`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, a built-in function that is not a predicate compared", () => {
    const issues = runProgram(program(`to_upper( lv ) = \`A\``));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, a functional method call compared", () => {
    const issues = runProgram(program(`get_flag( ) = abap_true`));
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, contains( ) = abap_true in open-abap", () => {
    const issues = runProgram(program(`contains( val = lv start = \` \` ) = abap_true`), [], Release["open-abap"]);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, a method named like a predicate function hides it", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS contains IMPORTING val TYPE string start TYPE string RETURNING VALUE(r) TYPE abap_bool.
    METHODS run.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD contains.
  ENDMETHOD.
  METHOD run.
    DATA lv TYPE string.
    IF contains( val = lv start = \` \` ) = abap_true.
    ENDIF.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });
});
