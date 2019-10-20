import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {TypedIdentifier} from "../../../src/abap/types/_typed_identifier";
import {StringType, CharacterType, IntegerType} from "../../../src/abap/types/basic/";
import {TypedConstantIdentifier} from "../../../src/abap/types/_typed_constant_identifier";
import {SyntaxLogic} from "../../../src/abap/syntax/syntax";
import {ABAPObject} from "../../../src/objects/_abap_object";

function runProgram(abap: string, name: string): TypedIdentifier | undefined {
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

function expectString(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(StringType);
}

function expectCharacter(identifier: TypedIdentifier | undefined, length: number) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(CharacterType);
  const type = identifier!.getType() as CharacterType;
  expect(type.getLength()).to.equal(length);
}

function expectConstantString(identifier: TypedIdentifier | undefined, value: string) {
  expectString(identifier);
  /*
  expect(identifier).to.not.equals(undefined);
  expect(identifier).to.be.instanceOf(TypedConstantIdentifier);
  expect(constant.getType()).to.be.instanceof(StringType);
  */
  const constant = identifier as TypedConstantIdentifier;
  expect(constant.getValue()).to.equal(value);
}

function expectConstantCharacter(identifier: TypedIdentifier | undefined, value: string, length: number) {
  expectCharacter(identifier, length);
  const constant = identifier as TypedConstantIdentifier;
  expect(constant.getValue()).to.equal(value);
}

/////////////////////////////////////

describe("Syntax - Basic Types", () => {

  it("nothing", () => {
    const abap = "WRITE foobar.";
    const identifier = runProgram(abap, "sdf");
    expect(identifier).to.equals(undefined);
  });

  it("DATA TYPE string", () => {
    const abap = "DATA foo TYPE string.";
    const identifier = runProgram(abap, "foo");
    expectString(identifier);
  });

  it("DATA TYPE c", () => {
    const abap = "DATA foo TYPE c.";
    const identifier = runProgram(abap, "foo");
    expectCharacter(identifier, 1);
  });

  it("DATA", () => {
    const abap = "DATA foo.";
    const identifier = runProgram(abap, "foo");
    expectCharacter(identifier, 1);
  });

  it("DATA TYPE i", () => {
    const abap = "DATA foo TYPE i.";
    const identifier = runProgram(abap, "foo");
    expect(identifier).to.not.equals(undefined);
    expect(identifier!.getType()).to.be.instanceof(IntegerType);
  });

  it("CONSTANTS TYPE string", () => {
    const abap = "CONSTANTS foo TYPE string VALUE 'sdf'.";
    const identifier = runProgram(abap, "foo");
    expectConstantString(identifier, "'sdf'");
  });

  it("CONSTANTS TYPE string IS INITIAL", () => {
    const abap = "CONSTANTS foo TYPE string VALUE IS INITIAL.";
    const identifier = runProgram(abap, "foo");
    expectConstantString(identifier, "");
  });

  it("CONSTANTS TYPE string VALUE moo", () => {
    const abap = "CONSTANTS moo TYPE string VALUE '2'.\n" +
    "CONSTANTS foo TYPE string VALUE moo.";
    const identifier = runProgram(abap, "foo");
    expectConstantString(identifier, "'2'");
  });

  it("CONSTANTS only value", () => {
    const abap = "CONSTANTS moo VALUE 3.";
    const identifier = runProgram(abap, "moo");
    expectConstantCharacter(identifier, "3", 1);
  });

  it("DATA TYPE c, length 5", () => {
    const abap = "DATA foo TYPE c LENGTH 5.";
    const identifier = runProgram(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c, text length", () => {
    const abap = "DATA foo TYPE c LENGTH '5'.";
    const identifier = runProgram(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c, text length", () => {
    const abap = "DATA foo TYPE c LENGTH `5`.";
    const identifier = runProgram(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c, +5", () => {
    const abap = "DATA foo TYPE c LENGTH +5.";
    const identifier = runProgram(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c", () => {
    const abap = "CONSTANTS len TYPE i VALUE 5.\n" +
      "DATA foo TYPE c LENGTH len.";
    const identifier = runProgram(abap, "foo");
    expectCharacter(identifier, 5);
  });
/*
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