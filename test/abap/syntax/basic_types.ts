import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {TypedIdentifier} from "../../../src/abap/types/_typed_identifier";
// import * as Basic from "../../../src/abap/types/basic";
import {SyntaxLogic} from "../../../src/abap/syntax/syntax";
import {ABAPObject} from "../../../src/objects/_abap_object";

function resolveType(abap: string, name: string): TypedIdentifier | undefined {
  const filename = "zfoobar.prog.abap";
  const file = new MemoryFile(filename, abap);
  const reg = new Registry().addFile(file).parse();

  const scope = new SyntaxLogic(reg, reg.getObjects()[0] as ABAPObject).traverseUntil();
  const identifier = scope.resolveVariable(name);

  if (identifier instanceof TypedIdentifier) {
    return identifier;
  }
  return undefined;
}
/*
function expectString(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.StringType);
}
*/
/*
function expectTable(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.TableType);
  const tab = identifier!.getType() as Basic.TableType;
  return tab.getRowType();
}

function expectInteger(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.IntegerType);
}

function expectCharacter(identifier: TypedIdentifier | undefined, length: number) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.CharacterType);
  const type = identifier!.getType() as Basic.CharacterType;
  expect(type.getLength()).to.equal(length);
}
*/

/////////////////////////////////////

describe("Syntax - Types", () => {

  it("nothing", () => {
    const abap = "WRITE foobar.";
    const identifier = resolveType(abap, "sdf");
    expect(identifier).to.equals(undefined);
  });
/*
  it("TYPE foo TYPE string", () => {
    const abap = "TYPES foo TYPE string.";
    const type = resolveType(abap, "foo");
    expectString(type);
  });
*/
});