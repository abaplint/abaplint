import {expect} from "chai";
import {runProgram} from "./syntax";

// Local names of FOR and LET, each case checked against the syntax check of an ABAP 7.58 system (A4H 816), #4561
const header = `
TYPES: BEGIN OF ty,
         k1 TYPE c LENGTH 3,
         k2 TYPE i,
         v  TYPE i,
       END OF ty.
TYPES ty_tab TYPE STANDARD TABLE OF ty WITH EMPTY KEY.
TYPES: BEGIN OF ty2,
         n     TYPE i,
         other TYPE string,
       END OF ty2.
TYPES ty_tab2 TYPE STANDARD TABLE OF ty2 WITH EMPTY KEY.
DATA tab TYPE ty_tab.
DATA tab2 TYPE ty_tab2.
`;

describe("syntax.ts, FOR and LET local names", () => {

  it("FOR, name of a data object of the procedure", () => {
    // A4H 816: "WA" was already declared.
    const issues = runProgram(header + `
DATA wa TYPE ty.
DATA(r) = VALUE string_table( FOR wa IN tab ( |{ wa-k1 }| ) ).`);
    expect(issues[0]?.getMessage()).to.equal("Variable wa already defined");
  });

  it("FOR GROUPS, name of a data object of the procedure", () => {
    // A4H 816: "GRP" was already declared.
    const issues = runProgram(header + `
DATA grp TYPE i.
DATA(r) = VALUE string_table( FOR GROUPS grp OF wa IN tab GROUP BY wa-k1 ( |{ grp }| ) ).`);
    expect(issues[0]?.getMessage()).to.equal("Variable grp already defined");
  });

  it("FOR, name of a method parameter", () => {
    // A4H 816: "P" was already declared.
    const issues = runProgram(header + `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS c IMPORTING p TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD c.
    DATA(r) = VALUE string_table( FOR p IN tab ( |{ p-k1 }| ) ).
  ENDMETHOD.
ENDCLASS.`);
    expect(issues[0]?.getMessage()).to.equal("Variable p already defined");
  });

  it("LET, name of a data object of the procedure", () => {
    // A4H 816: "X" was already declared.
    const issues = runProgram(header + `
DATA x TYPE i.
DATA(r) = VALUE string_table( LET x = 1 IN ( |{ x }| ) ).`);
    expect(issues[0]?.getMessage()).to.equal("Variable x already defined");
  });

  it("FOR, name of an attribute, ok, the attribute is only obscured", () => {
    // A4H 816: warning, Field "M" obscures a global field with the same name.
    const issues = runProgram(header + `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA m TYPE i.
    METHODS c.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD c.
    DATA(r) = VALUE string_table( FOR m IN tab ( |{ m-k1 }| ) ).
  ENDMETHOD.
ENDCLASS.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LET, name of an attribute, ok, the attribute is only obscured", () => {
    // A4H 816: warning, Field "M" obscures a global field with the same name.
    const issues = runProgram(header + `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA m TYPE i.
    METHODS c.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD c.
    DATA(r) = VALUE string_table( LET m = 1 IN ( |{ m }| ) ).
  ENDMETHOD.
ENDCLASS.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FOR, same name in two expressions with different types", () => {
    // A4H 816: "M" was already declared with the type "TY" and cannot be used with the type "TY2" here.
    const issues = runProgram(header + `
DATA(r1) = VALUE string_table( FOR m IN tab ( |{ m-k1 }| ) ).
DATA(r2) = VALUE string_table( FOR m IN tab2 ( m-other ) ).`);
    expect(issues[0]?.getMessage()).to.equal("Variable m already defined with a different type");
  });

  it("LET, same name in two expressions with different types", () => {
    // A4H 816: "X" was already declared with the type "I" and cannot be used with the type "STRING" here.
    const issues = runProgram(header + `
DATA(r1) = VALUE string_table( LET x = 1 IN ( |{ x }| ) ).
DATA(r2) = VALUE string_table( LET x = \`a\` IN ( x ) ).`);
    expect(issues[0]?.getMessage()).to.equal("Variable x already defined with a different type");
  });

  it("FOR and LET, same name with different types in a method", () => {
    // A4H 816: "M" was already declared with the type "TY" and cannot be used with the type "I" here.
    const issues = runProgram(header + `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS c IMPORTING tab TYPE ty_tab.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD c.
    DATA(r1) = VALUE string_table( FOR m IN tab ( |{ m-k1 }| ) ).
    DATA(r2) = VALUE string_table( LET m = 1 IN ( |{ m }| ) ).
  ENDMETHOD.
ENDCLASS.`);
    expect(issues[0]?.getMessage()).to.equal("Variable m already defined with a different type");
  });

  it("FOR, same name in two expressions with the same type, ok", () => {
    const issues = runProgram(header + `
DATA(r1) = VALUE string_table( FOR m IN tab ( |{ m-k1 }| ) ).
DATA(r2) = VALUE string_table( FOR m IN tab ( |{ m-v }| ) ).`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FOR, same name with different types in two methods, ok", () => {
    const issues = runProgram(header + `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS a IMPORTING tab TYPE ty_tab.
    METHODS b IMPORTING tab2 TYPE ty_tab2.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD a.
    DATA(r) = VALUE string_table( FOR x IN tab ( |{ x-k1 }| ) ).
  ENDMETHOD.
  METHOD b.
    DATA(r) = VALUE string_table( FOR x IN tab2 ( x-other ) ).
  ENDMETHOD.
ENDCLASS.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

});
