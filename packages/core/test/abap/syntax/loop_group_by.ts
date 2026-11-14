import {expect} from "chai";
import * as Basic from "../../../src/abap/types/basic";
import {Registry} from "../../../src/registry";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {Position} from "../../../src/position";
import {MemoryFile} from "../../../src/files/memory_file";
import {AbstractType} from "../../../src/abap/types/basic/_abstract_type";
import {runProgram} from "./syntax";

const header = `
TYPES: BEGIN OF ty,
         k1 TYPE c LENGTH 3,
         k2 TYPE i,
         v  TYPE i,
       END OF ty.
DATA tab TYPE STANDARD TABLE OF ty WITH EMPTY KEY.
`;

function resolveType(abap: string, name: string): AbstractType | undefined {
  const filename = "zfoobar.prog.abap";
  const reg = new Registry().addFile(new MemoryFile(filename, header + abap));
  reg.parse();
  const result = new SyntaxLogic(reg, reg.getFirstObject() as ABAPObject).run();
  expect(result.issues.map(i => i.getMessage())).to.deep.equal([]);
  return result.spaghetti.lookupPosition(new Position(1, 1), filename)?.findVariable(name)?.getType();
}

function expectRowType(type: AbstractType | undefined) {
  expect(type).to.be.instanceof(Basic.StructureType);
  expect((type as Basic.StructureType).getComponents().map(c => c.name)).to.deep.equal(["k1", "k2", "v"]);
}

describe("syntax.ts, LOOP AT ... GROUP BY and FOR GROUPS types", () => {

  it("structured key, INTO DATA", () => {
    const type = resolveType(`
LOOP AT tab INTO DATA(row) GROUP BY ( k1 = row-k1 k2 = row-k2 size = GROUP SIZE idx = GROUP INDEX ) INTO DATA(grp).
ENDLOOP.`, "grp");
    expect(type).to.be.instanceof(Basic.StructureType);
    const components = (type as Basic.StructureType).getComponents();
    expect(components.map(c => c.name)).to.deep.equal(["k1", "k2", "size", "idx"]);
    expect(components[0].type).to.be.instanceof(Basic.CharacterType);
    expect((components[0].type as Basic.CharacterType).getLength()).to.equal(3);
    expect(components[1].type).to.be.instanceof(Basic.IntegerType);
    expect(components[2].type).to.be.instanceof(Basic.IntegerType);
    expect(components[3].type).to.be.instanceof(Basic.IntegerType);
  });

  it("simple key, INTO DATA", () => {
    const type = resolveType(`
LOOP AT tab INTO DATA(row) GROUP BY row-k2 INTO DATA(grp).
ENDLOOP.`, "grp");
    expect(type).to.be.instanceof(Basic.IntegerType);
  });

  it("simple key, REFERENCE INTO DATA", () => {
    const type = resolveType(`
LOOP AT tab REFERENCE INTO DATA(rref) GROUP BY rref->k2 REFERENCE INTO DATA(gref).
ENDLOOP.`, "gref");
    expect(type).to.be.instanceof(Basic.DataReference);
    expect((type as Basic.DataReference).getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("simple key, ASSIGNING FIELD-SYMBOL", () => {
    const type = resolveType(`
LOOP AT tab ASSIGNING FIELD-SYMBOL(<row>) GROUP BY <row>-k2 ASSIGNING FIELD-SYMBOL(<grp>).
ENDLOOP.`, "<grp>");
    expect(type).to.be.instanceof(Basic.IntegerType);
  });

  it("LOOP AT GROUP INTO DATA, member has the row type", () => {
    expectRowType(resolveType(`
LOOP AT tab INTO DATA(row) GROUP BY ( k1 = row-k1 ) INTO DATA(grp).
  LOOP AT GROUP grp INTO DATA(member).
  ENDLOOP.
ENDLOOP.`, "member"));
  });

  it("LOOP AT GROUP field symbol, member has the row type", () => {
    expectRowType(resolveType(`
LOOP AT tab ASSIGNING FIELD-SYMBOL(<row>) GROUP BY <row>-k2 ASSIGNING FIELD-SYMBOL(<grp>).
  LOOP AT GROUP <grp> ASSIGNING FIELD-SYMBOL(<member>).
  ENDLOOP.
ENDLOOP.`, "<member>"));
  });

  it("LOOP AT GROUP REFERENCE INTO, member is a reference to the row type", () => {
    const type = resolveType(`
LOOP AT tab INTO DATA(row) GROUP BY row-k2 INTO DATA(grp).
  LOOP AT GROUP grp REFERENCE INTO DATA(mref).
  ENDLOOP.
ENDLOOP.`, "mref");
    expect(type).to.be.instanceof(Basic.DataReference);
    expectRowType((type as Basic.DataReference).getType());
  });

  it("LOOP AT GROUP on the representative, no group target", () => {
    expectRowType(resolveType(`
LOOP AT tab INTO DATA(row) GROUP BY row-k2.
  LOOP AT GROUP row INTO DATA(member).
  ENDLOOP.
ENDLOOP.`, "member"));
  });

  it("error, unknown component of the group", () => {
    const issues = runProgram(header + `
LOOP AT tab INTO DATA(row) GROUP BY ( k1 = row-k1 ) INTO DATA(grp).
  WRITE grp-v.
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.contain("Component \"v\" not found");
  });

  it("LOOP AT GROUP WHERE uses the row type", () => {
    const issues = runProgram(header + `
LOOP AT tab INTO DATA(row) GROUP BY row-k2 INTO DATA(grp).
  LOOP AT GROUP grp INTO DATA(member) WHERE v = 2.
  ENDLOOP.
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FOR GROUPS, structured key and members", () => {
    const issues = runProgram(header + `
DATA(result) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY ( k1 = wa-k1 cnt = GROUP SIZE )
  LET members = REDUCE i( INIT s = 0 FOR m IN GROUP grp NEXT s = s + m-v ) IN
  ( |{ grp-k1 } { grp-cnt } { members }| ) ).`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FOR GROUPS, error, unknown component of the group", () => {
    const issues = runProgram(header + `
DATA(result) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY ( k1 = wa-k1 )
  ( |{ grp-v }| ) ).`);
    expect(issues[0]?.getMessage()).to.contain("Component \"v\" not found");
  });

  it("FOR GROUPS, error, unknown component in the key", () => {
    const issues = runProgram(header + `
DATA(result) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY wa-unknown
  ( |{ grp }| ) ).`);
    expect(issues[0]?.getMessage()).to.contain("not found");
  });

});

// Visibility of the group variables, each case checked against a 7.58 (A4H 816) syntax check
describe("syntax.ts, LOOP AT ... GROUP BY and FOR GROUPS, visibility of the group variables", () => {

  const header2 = header + `
TYPES: BEGIN OF ty2,
         n     TYPE i,
         other TYPE string,
       END OF ty2.
DATA tab2 TYPE STANDARD TABLE OF ty2 WITH EMPTY KEY.
`;

  it("LOOP, inline group variable is visible after ENDLOOP, like any inline declaration", () => {
    const issues = runProgram(header + `
LOOP AT tab INTO DATA(row) GROUP BY ( k1 = row-k1 ) INTO DATA(grp).
ENDLOOP.
WRITE / grp-k1.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP, inline group variable cannot be declared twice in the same procedure", () => {
    const issues = runProgram(header + `
LOOP AT tab INTO DATA(row) GROUP BY row-k2 INTO DATA(grp).
ENDLOOP.
LOOP AT tab INTO DATA(row2) GROUP BY row2-k2 INTO DATA(grp).
ENDLOOP.`);
    expect(issues.length).to.equal(1);
  });

  it("LOOP, pre-declared group variable reused for two tables, members follow the table of each loop", () => {
    const issues = runProgram(header2 + `
DATA grp TYPE i.
LOOP AT tab INTO DATA(row) GROUP BY row-k2 INTO grp.
  LOOP AT GROUP grp INTO DATA(m1).
    WRITE / m1-v.
  ENDLOOP.
ENDLOOP.
LOOP AT tab2 INTO DATA(row2) GROUP BY row2-n INTO grp.
  LOOP AT GROUP grp INTO DATA(m2).
    WRITE / m2-other.
  ENDLOOP.
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP, LOOP AT GROUP outside of the group loop is an error", () => {
    // A4H 816: No group is bound to "GRP".
    const issues = runProgram(header + `
LOOP AT tab INTO DATA(row) GROUP BY row-k2 INTO DATA(grp).
ENDLOOP.
LOOP AT GROUP grp INTO DATA(member).
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal("No group is bound to \"grp\"");
  });

  it("LOOP, group is still bound after a nested group loop over its members ends", () => {
    const issues = runProgram(header + `
LOOP AT tab INTO DATA(row) GROUP BY row-k1 INTO DATA(grp).
  LOOP AT GROUP grp INTO DATA(member) GROUP BY member-k2 INTO DATA(sub).
    LOOP AT GROUP sub INTO DATA(inner).
    ENDLOOP.
  ENDLOOP.
  LOOP AT GROUP grp INTO DATA(again).
  ENDLOOP.
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP, nested group is not bound after its ENDLOOP", () => {
    // A4H 816: No group is bound to "SUB".
    const issues = runProgram(header + `
LOOP AT tab INTO DATA(row) GROUP BY row-k1 INTO DATA(grp).
  LOOP AT GROUP grp INTO DATA(member) GROUP BY member-k2 INTO DATA(sub).
  ENDLOOP.
  LOOP AT GROUP sub INTO DATA(inner).
  ENDLOOP.
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal("No group is bound to \"sub\"");
  });

  it("LOOP, pre-declared variable without any group loop is not a group", () => {
    // A4H 816: No group is bound to "GRP".
    const issues = runProgram(header + `
DATA grp TYPE i.
LOOP AT GROUP grp INTO DATA(member).
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal("No group is bound to \"grp\"");
  });

  it("FOR GROUPS, group variable is not visible after the expression", () => {
    const issues = runProgram(header + `
DATA(result) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY wa-k1
  ( |{ grp }| ) ).
WRITE / grp.`);
    expect(issues[0]?.getMessage()).to.contain("grp");
  });

  it("FOR GROUPS, work area is not visible after the expression", () => {
    const issues = runProgram(header + `
DATA(result) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY wa-k1
  ( |{ grp }| ) ).
WRITE / wa-k1.`);
    expect(issues[0]?.getMessage()).to.contain("wa");
  });

  it("FOR GROUPS, same group name in two expressions with the same types, ok", () => {
    const issues = runProgram(header + `
DATA(r1) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY wa-k2
  FOR m IN GROUP grp ( |{ m-v }| ) ).
DATA(r2) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY wa-k2
  FOR m IN GROUP grp ( |{ m-k1 }| ) ).`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

});

// What can be passed to a method inside the group loops, each case checked against a 7.58 (A4H 816) syntax check
describe("syntax.ts, LOOP AT ... GROUP BY and FOR GROUPS, passing group variables to methods", () => {

  const classHeader = header + `
TYPES ty_tab TYPE STANDARD TABLE OF ty WITH EMPTY KEY.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS row_to_str IMPORTING r TYPE ty RETURNING VALUE(s) TYPE string.
    CLASS-METHODS int_to_str IMPORTING i TYPE i RETURNING VALUE(s) TYPE string.
    CLASS-METHODS tab_to_str IMPORTING t TYPE ty_tab RETURNING VALUE(s) TYPE string.
    CLASS-METHODS change_row CHANGING r TYPE ty.
    CLASS-METHODS key_of IMPORTING r TYPE ty RETURNING VALUE(k) TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD row_to_str.
  ENDMETHOD.
  METHOD int_to_str.
  ENDMETHOD.
  METHOD tab_to_str.
  ENDMETHOD.
  METHOD change_row.
  ENDMETHOD.
  METHOD key_of.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
`;

  // LOOP AT ... GROUP BY

  it("LOOP, group key passed to a parameter of the key type, ok", () => {
    const issues = runProgram(classHeader + `
LOOP AT tab INTO DATA(row) GROUP BY row-k2 INTO DATA(grp).
  lcl=>int_to_str( grp ).
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP, component of a structured group key passed, ok", () => {
    const issues = runProgram(classHeader + `
LOOP AT tab INTO DATA(row) GROUP BY ( k2 = row-k2 size = GROUP SIZE ) INTO DATA(grp).
  lcl=>int_to_str( grp-k2 ).
  lcl=>int_to_str( grp-size ).
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP, group key from a method call in GROUP BY, passed to a parameter of the key type, ok", () => {
    const issues = runProgram(classHeader + `
LOOP AT tab INTO DATA(row) GROUP BY lcl=>key_of( row ) INTO DATA(grp).
  lcl=>int_to_str( grp ).
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP, representative passed to a parameter of the row type, ok", () => {
    const issues = runProgram(classHeader + `
LOOP AT tab INTO DATA(row) GROUP BY row-k2.
  lcl=>row_to_str( row ).
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP, member passed to a parameter of the row type, ok", () => {
    const issues = runProgram(classHeader + `
LOOP AT tab INTO DATA(row) GROUP BY row-k2 INTO DATA(grp).
  LOOP AT GROUP grp INTO DATA(member).
    lcl=>row_to_str( member ).
  ENDLOOP.
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP, member field symbol passed as CHANGING, ok", () => {
    const issues = runProgram(classHeader + `
LOOP AT tab ASSIGNING FIELD-SYMBOL(<row>) GROUP BY <row>-k2 ASSIGNING FIELD-SYMBOL(<grp>).
  LOOP AT GROUP <grp> ASSIGNING FIELD-SYMBOL(<member>).
    lcl=>change_row( CHANGING r = <member> ).
  ENDLOOP.
ENDLOOP.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("LOOP, error, group passed to a table parameter, a group is not a table", () => {
    const issues = runProgram(classHeader + `
LOOP AT tab INTO DATA(row) GROUP BY row-k2 INTO DATA(grp).
  lcl=>tab_to_str( grp ).
ENDLOOP.`);
    expect(issues.length).to.equal(1);
  });

  it("LOOP, error, member passed to a parameter of the key type", () => {
    const issues = runProgram(classHeader + `
LOOP AT tab INTO DATA(row) GROUP BY row-k2 INTO DATA(grp).
  LOOP AT GROUP grp INTO DATA(member).
    lcl=>int_to_str( member ).
  ENDLOOP.
ENDLOOP.`);
    expect(issues.length).to.equal(1);
  });

  it("LOOP, error, structured group key passed to a parameter of the row type", () => {
    const issues = runProgram(classHeader + `
LOOP AT tab INTO DATA(row) GROUP BY ( k1 = row-k1 k2 = row-k2 ) INTO DATA(grp).
  lcl=>row_to_str( grp ).
ENDLOOP.`);
    expect(issues.length).to.equal(1);
  });

  // FOR GROUPS

  it("FOR GROUPS, group key passed to a parameter of the key type, ok", () => {
    const issues = runProgram(classHeader + `
DATA(result) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY wa-k2
  ( lcl=>int_to_str( grp ) ) ).`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FOR GROUPS, member passed to a parameter of the row type, ok", () => {
    const issues = runProgram(classHeader + `
DATA(result) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY wa-k2
  FOR m IN GROUP grp
  ( lcl=>row_to_str( m ) ) ).`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FOR GROUPS, method call in GROUP BY, key passed to a parameter of the key type, ok", () => {
    const issues = runProgram(classHeader + `
DATA(result) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY lcl=>key_of( wa )
  ( lcl=>int_to_str( grp ) ) ).`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("FOR GROUPS, error, group passed to a table parameter, a group is not a table", () => {
    const issues = runProgram(classHeader + `
DATA(result) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY wa-k2
  ( lcl=>tab_to_str( grp ) ) ).`);
    expect(issues.length).to.equal(1);
  });

  it("FOR GROUPS, error, member passed to a parameter of the key type", () => {
    const issues = runProgram(classHeader + `
DATA(result) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY wa-k2
  FOR m IN GROUP grp
  ( lcl=>int_to_str( m ) ) ).`);
    expect(issues.length).to.equal(1);
  });

  it("FOR GROUPS, work area passed to a parameter of the row type in the result, ok", () => {
    const issues = runProgram(classHeader + `
DATA(result) = VALUE string_table(
  FOR GROUPS grp OF wa IN tab GROUP BY wa-k2
  ( lcl=>row_to_str( wa ) ) ).`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

});
