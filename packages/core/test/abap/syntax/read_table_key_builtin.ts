import {expect} from "chai";
import {runProgram} from "./syntax";
import {Release} from "../../../src/version";

describe("syntax.ts, built-in function as a READ TABLE key operand before 7.40", () => {
  const program = (read: string): string => `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_row,
             url  TYPE string,
             name TYPE string,
           END OF ty_row.
    TYPES ty_rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY
      WITH NON-UNIQUE SORTED KEY by_name COMPONENTS name.
    METHODS get_text IMPORTING iv TYPE string RETURNING VALUE(r) TYPE string.
    METHODS run IMPORTING iv_url TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get_text.
    r = iv.
  ENDMETHOD.
  METHOD run.
    DATA lt TYPE ty_rows.
    DATA ls TYPE ty_row.
    DATA lt_names TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA lo TYPE REF TO lcl.
    DATA lv_len TYPE i.
    ${read}
  ENDMETHOD.
ENDCLASS.`;

  it("error, to_lower( ) in WITH KEY", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls WITH KEY url = to_lower( iv_url ).`), [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(`Built-in function "to_lower" cannot be a READ TABLE key operand before 7.40`);
  });

  it("error, to_upper( ) on table_line", () => {
    const read = `READ TABLE lt_names WITH KEY table_line = to_upper( iv_url ) TRANSPORTING NO FIELDS.`;
    const issues = runProgram(program(read), [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(`Built-in function "to_upper" cannot be a READ TABLE key operand before 7.40`);
  });

  it("error, the second key component", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls WITH KEY url = iv_url name = condense( iv_url ).`), [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(`Built-in function "condense" cannot be a READ TABLE key operand before 7.40`);
  });

  it("error, named argument", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls WITH KEY url = to_lower( val = iv_url ).`), [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(`Built-in function "to_lower" cannot be a READ TABLE key operand before 7.40`);
  });

  it("error, WITH TABLE KEY ... COMPONENTS", () => {
    const read = `READ TABLE lt INTO ls WITH TABLE KEY by_name COMPONENTS name = to_upper( iv_url ).`;
    const issues = runProgram(program(read), [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(`Built-in function "to_upper" cannot be a READ TABLE key operand before 7.40`);
  });

  it("error, v700", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls WITH KEY url = to_lower( iv_url ).`), [], Release.v700);
    expect(issues[0]?.getMessage()).to.equal(`Built-in function "to_lower" cannot be a READ TABLE key operand before 7.40`);
  });

  it("ok, a variable", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls WITH KEY url = iv_url.`), [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, a functional method call", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls WITH KEY url = get_text( iv_url ).`), [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, a functional method call on an object", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls WITH KEY url = lo->get_text( iv_url ).`), [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, a built-in function as argument of a functional method call", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls WITH KEY url = get_text( to_lower( iv_url ) ).`), [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, strlen( )", () => {
    const read = `READ TABLE lt_names WITH KEY table_line = strlen( iv_url ) TRANSPORTING NO FIELDS.`;
    const issues = runProgram(program(read), [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, lines( ) after INDEX", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls INDEX lines( lt ).`), [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, v740sp02", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls WITH KEY url = to_lower( iv_url ).`), [], Release.v740sp02);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, v750", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls WITH KEY url = to_lower( iv_url ).`), [], Release.v750);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, open-abap", () => {
    const issues = runProgram(program(`READ TABLE lt INTO ls WITH KEY url = to_lower( iv_url ).`), [], Release["open-abap"]);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, a method named like a built-in function hides it", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS to_lower IMPORTING val TYPE string RETURNING VALUE(r) TYPE string.
    METHODS run IMPORTING iv_url TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD to_lower.
    r = val.
  ENDMETHOD.
  METHOD run.
    DATA lt TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    READ TABLE lt WITH KEY table_line = to_lower( iv_url ) TRANSPORTING NO FIELDS.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runProgram(abap, [], Release.v702);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });
});
