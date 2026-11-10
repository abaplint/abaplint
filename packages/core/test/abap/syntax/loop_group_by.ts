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
