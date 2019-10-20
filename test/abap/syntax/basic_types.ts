import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {TypedIdentifier} from "../../../src/abap/types/_typed_identifier";
import {BasicTypes} from "../../../src/abap/syntax/basic_types";
import {StringType, CharacterType} from "../../../src/abap/types/basic/";
import {Scope} from "../../../src/abap/syntax/_scope";
import {TypedConstantIdentifier} from "../../../src/abap/types/_typed_constant_identifier";

function runProgram(abap: string): TypedIdentifier | undefined {
  const filename = "zfoobar.prog.abap";
  const file = new MemoryFile(filename, abap);
  const reg = new Registry().addFile(file).parse();

  expect(reg.getABAPFiles().length).to.equal(1);
  const stru = reg.getABAPFiles()[0].getStructure();
  expect(stru).to.not.equal(undefined);
  const statement = stru!.findAllStatementNodes();
  expect(statement.length).equal(1);

  const identifier = new BasicTypes(filename, new Scope([])).build(statement[0]);
  if (identifier instanceof TypedIdentifier) {
    return identifier;
  }
  return undefined;
}

/////////////////////////////////////

describe("Syntax - Basic Types", () => {

  it("nothing", () => {
    const abap = "WRITE foobar.";
    const identifier = runProgram(abap);
    expect(identifier).to.equals(undefined);
  });

  it("DATA TYPE string", () => {
    const abap = "DATA foo TYPE string.";
    const identifier = runProgram(abap);
    expect(identifier).to.not.equals(undefined);
    expect(identifier!.getName()).to.equal("foo");
    expect(identifier!.getType()).to.be.instanceof(StringType);
  });

  it("DATA TYPE c", () => {
    const abap = "DATA foo TYPE c.";
    const identifier = runProgram(abap);
    expect(identifier).to.not.equals(undefined);
    expect(identifier!.getType()).to.be.instanceof(CharacterType);
    const type = identifier!.getType() as CharacterType;
    expect(type.getLength()).to.equal(1);
  });
/*
  it("DATA TYPE i", () => {
    const abap = "DATA foo TYPE i.";
    const identifier = runProgram(abap);
    expect(identifier).to.not.equals(undefined);
    expect(identifier!.getType()).to.be.instanceof(IntegerType);
  });
*/
  it("CONSTANTS, missing VALUE", () => {
    const abap = "CONSTANTS foo TYPE string.";
    expect(() => { runProgram(abap); }).to.throw("set VALUE, foo");
  });

  it("CONSTANTS TYPE string", () => {
    const abap = "CONSTANTS foo TYPE string VALUE 'sdf'.";
    const identifier = runProgram(abap);
    expect(identifier).to.not.equals(undefined);
    expect(identifier).to.be.instanceOf(TypedConstantIdentifier);
    const constant = identifier as TypedConstantIdentifier;
    expect(constant.getType()).to.be.instanceof(StringType);
    expect(constant.getValue()).to.equal("'sdf'");
  });

//  "CONSTANTS moo TYPE c VALUE space."

/*
  it("DATA TYPE c", () => {
    const abap = "DATA foo TYPE c LENGTH 5.";
    const identifier = runProgram(abap);
    expect(identifier).to.not.equals(undefined);
    expect(identifier!.getType()).to.be.instanceof(CharacterType);
    const type = identifier!.getType() as CharacterType;
    expect(type.getLength()).to.equal(5);
  });

  it("DATA TYPE c", () => {
    const abap = "DATA foo(5) TYPE c.";
    const identifier = runProgram(abap);
    expect(identifier).to.not.equals(undefined);
    expect(identifier!.getType()).to.be.instanceof(CharacterType);
    const type = identifier!.getType() as CharacterType;
    expect(type.getLength()).to.equal(5);
  });
*/
});