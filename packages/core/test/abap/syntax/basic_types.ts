import {expect} from "chai";
import * as Basic from "../../../src/abap/types/basic";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {TypedIdentifier} from "../../../src/abap/types/_typed_identifier";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {Position} from "../../../src/position";

function resolveType(abap: string, name: string): TypedIdentifier | undefined {
  const filename = "zfoobar.prog.abap";
  const reg = new Registry().addFile(new MemoryFile(filename, abap)).parse();
  const obj = reg.getObjects()[0] as ABAPObject;
  const scope = new SyntaxLogic(reg, obj).run().spaghetti.lookupPosition(new Position(1, 1), filename);
  return scope?.findType(name);
}

function expectString(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.StringType);
}

function expectStructure(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.StructureType);
  const tab = identifier!.getType() as Basic.StructureType;
  return tab.getComponents();
}

function expectTable(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.TableType);
  const tab = identifier!.getType() as Basic.TableType;
  return tab.getRowType();
}

/*
function expectCharacter(identifier: TypedIdentifier | undefined, length: number) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.CharacterType);
  const type = identifier!.getType() as Basic.CharacterType;
  expect(type.getLength()).to.equal(length);
}
*/

/////////////////////////////////////

describe("Syntax - Basic Types", () => {

  it("nothing", () => {
    const abap = "WRITE foobar.";
    const identifier = resolveType(abap, "sdf");
    expect(identifier).to.equals(undefined);
  });

  it("string", () => {
    const abap = "TYPES foo TYPE string.";
    const type = resolveType(abap, "foo");
    expectString(type);
  });

  it("table", () => {
    const abap = "TYPES foo TYPE STANDARD TABLE OF string.";
    const type = resolveType(abap, "foo");
    const row = expectTable(type);
    expect(row).to.be.instanceOf(Basic.StringType);
  });

  it("structure", () => {
    const abap = `
    TYPES: BEGIN OF foo,
      bar TYPE i,
    END OF foo.`;
    const type = resolveType(abap, "foo");
    const components = expectStructure(type);
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("bar");
    expect(components[0].type).to.be.instanceof(Basic.IntegerType);
  });

  it("INCLUDE TYPE", () => {
    const abap = `
      TYPES: BEGIN OF foo1,
               field TYPE i,
             END OF foo1.
      TYPES: BEGIN OF foo2,
               moo TYPE f.
          INCLUDE TYPE foo1.
      TYPES END OF foo2.`;
    const type = resolveType(abap, "foo2");
    const components = expectStructure(type);
    expect(components.length).to.equal(2);
    expect(components[0].name).to.equal("moo");
    expect(components[0].type).to.be.instanceof(Basic.FloatType);
    expect(components[1].name).to.equal("field");
    expect(components[1].type).to.be.instanceof(Basic.IntegerType);
  });

  it("TYPE unresolveable", () => {
    const abap = "TYPES foo TYPE zsdfsd.";
    const type = resolveType(abap, "foo");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.UnknownType);
  });

});