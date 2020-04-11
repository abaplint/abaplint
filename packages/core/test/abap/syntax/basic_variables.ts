import {expect} from "chai";
import * as Basic from "../../../src/abap/types/basic";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {TypedIdentifier, IdentifierMeta} from "../../../src/abap/types/_typed_identifier";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {Position} from "../../../src/position";

function resolveVariable(abap: string, name: string): TypedIdentifier | undefined {
  const filename = "zfoobar.prog.abap";
  return runMulti([{filename: filename, contents: abap}], name);
}

function runMulti(files: {filename: string, contents: string}[], name: string): TypedIdentifier | undefined {
  const reg = new Registry();
  for (const file of files) {
    reg.addFile(new MemoryFile(file.filename, file.contents));
  }
  reg.parse();

  const obj = reg.getObjects()[files.length - 1] as ABAPObject;
  const filename = files[files.length - 1].filename;
  const scope = new SyntaxLogic(reg, obj).run().spaghetti.lookupPosition(new Position(1, 1), filename);
  return scope?.findVariable(name);
}

function expectStructure(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.StructureType);
  const tab = identifier!.getType() as Basic.StructureType;
  return tab.getComponents();
}

function expectString(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.StringType);
}

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

function expectConstantString(identifier: TypedIdentifier | undefined, value: string) {
  expectString(identifier);
  expect(identifier!.getValue()).to.equal(value);
  expect(identifier!.getMeta()).to.include(IdentifierMeta.ReadOnly);
}

function expectConstantCharacter(identifier: TypedIdentifier | undefined, value: string, length: number) {
  expectCharacter(identifier, length);
  expect(identifier!.getValue()).to.equal(value);
  expect(identifier!.getMeta()).to.include(IdentifierMeta.ReadOnly);
}

/////////////////////////////////////

describe("Syntax - Basic Types", () => {

  it("nothing", () => {
    const abap = "WRITE foobar.";
    const identifier = resolveVariable(abap, "sdf");
    expect(identifier).to.equals(undefined);
  });

  it("DATA TYPE string", () => {
    const abap = "DATA foo TYPE string.";
    const identifier = resolveVariable(abap, "foo");
    expectString(identifier);
  });

  it("DATA TYPE c", () => {
    const abap = "DATA foo TYPE c.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 1);
  });

  it("DATA", () => {
    const abap = "DATA foo.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 1);
  });

  it("DATA TYPE i", () => {
    const abap = "DATA foo TYPE i.";
    const identifier = resolveVariable(abap, "foo");
    expectInteger(identifier);
  });

  it("DATA TYPE xstring", () => {
    const abap = "DATA foo TYPE xstring.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.XStringType);
  });

  it("DATA TYPE d", () => {
    const abap = "DATA foo TYPE d.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.DateType);
  });

  it("DATA TYPE t", () => {
    const abap = "DATA foo TYPE t.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.TimeType);
  });

  it("DATA TYPE n", () => {
    const abap = "DATA foo TYPE n.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.NumericType);
  });

  it("DATA TYPE x", () => {
    const abap = "DATA foo TYPE x.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.HexType);
  });

  it("CONSTANTS TYPE string", () => {
    const abap = "CONSTANTS foo TYPE string VALUE 'sdf'.";
    const identifier = resolveVariable(abap, "foo");
    expectConstantString(identifier, "'sdf'");
  });

  it("CONSTANTS TYPE string IS INITIAL", () => {
    const abap = "CONSTANTS foo TYPE string VALUE IS INITIAL.";
    const identifier = resolveVariable(abap, "foo");
    expectConstantString(identifier, "");
  });

  it("CONSTANTS TYPE string VALUE moo", () => {
    const abap = "CONSTANTS moo TYPE string VALUE '2'.\n" +
    "CONSTANTS foo TYPE string VALUE moo.";
    const identifier = resolveVariable(abap, "foo");
    expectConstantString(identifier, "'2'");
  });

  it("CONSTANTS only value", () => {
    const abap = "CONSTANTS moo VALUE 3.";
    const identifier = resolveVariable(abap, "moo");
    expectConstantCharacter(identifier, "3", 1);
  });

  it("DATA TYPE c, length 5", () => {
    const abap = "DATA foo TYPE c LENGTH 5.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c, text length", () => {
    const abap = "DATA foo TYPE c LENGTH '5'.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c, text length", () => {
    const abap = "DATA foo TYPE c LENGTH `5`.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c, +5", () => {
    const abap = "DATA foo TYPE c LENGTH +5.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c", () => {
    const abap =
      "CONSTANTS len TYPE i VALUE 5.\n" +
      "DATA foo TYPE c LENGTH len.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c, pre, 5", () => {
    const abap = "DATA foo(5) TYPE c.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("table, string", () => {
    const abap = "DATA tab TYPE STANDARD TABLE OF string.";
    const identifier = resolveVariable(abap, "tab");
    const rowType = expectTable(identifier);
    expect(rowType).to.be.instanceOf(Basic.StringType);
  });

  it("table, integer.", () => {
    const abap = "DATA tab TYPE STANDARD TABLE OF i.";
    const identifier = resolveVariable(abap, "tab");
    const rowType = expectTable(identifier);
    expect(rowType).to.be.instanceOf(Basic.IntegerType);
  });

  it("data with defined type", () => {
    const abap =
      "TYPES typ TYPE i.\n" +
      "DATA foo TYPE typ.";
    const identifier = resolveVariable(abap, "foo");
    expectInteger(identifier);
  });

  it("DATA structured table", () => {
    const abap = `
      TYPES: BEGIN OF foo1,
               field TYPE i,
             END OF foo1.
      DATA tab TYPE STANDARD TABLE OF foo1 WITH EMPTY KEY.`;
    const type = resolveVariable(abap, "tab");
    const rowType = expectTable(type);
    expect(rowType).to.be.instanceof(Basic.StructureType);
    const stru = rowType as Basic.StructureType;
    const components = stru.getComponents();
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("field");
  });

  it("ref to object", () => {
    const abap = `
    CLASS lcl_class DEFINITION.
    ENDCLASS.
    CLASS lcl_class IMPLEMENTATION.
    ENDCLASS.
    DATA lo_class TYPE REF TO lcl_class.`;
    const type = resolveVariable(abap, "lo_class");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.ObjectReferenceType);
  });

  it("ref to object, unknown", () => {
    const abap = `
    DATA lo_class TYPE REF TO lcl_sdfsdsdf.`;
    const type = resolveVariable(abap, "lo_class");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.UnknownType);
  });

  it("ref to interface", () => {
    const abap = `
    INTERFACE lif_foo.
    ENDINTERFACE.
    DATA li_intf TYPE REF TO lif_foo.`;
    const type = resolveVariable(abap, "li_intf");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.ObjectReferenceType);
  });

  it("ref to global class", () => {
    const clas = `
      CLASS zcl_global DEFINITION PUBLIC.
      ENDCLASS.
      CLASS zcl_global IMPLEMENTATION.
      ENDCLASS.`;
    const prog = `DATA lo_class TYPE REF TO zcl_global.`;
    const type = runMulti(
      [{filename: "zcl_global.clas.abap", contents: clas},
        {filename: "zfoobar.prog.abap", contents: prog}],
      "lo_class");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.ObjectReferenceType);
  });

  it("DATA abap_bool", () => {
    const abap = "DATA foo TYPE abap_bool.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 1);
  });

  it("DDIC data element", () => {
    const clas = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDDIC</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000002</LENG>
    <OUTPUTLEN>000002</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const prog = `DATA foo TYPE zddic.`;
    const type = runMulti(
      [{filename: "zddic.dtel.xml", contents: clas},
        {filename: "zfoobar.prog.abap", contents: prog}],
      "foo");
    expectCharacter(type, 2);
  });

  it("structured DATA, BEGIN OF", () => {
    const abap = `
    DATA: BEGIN OF foo,
      bar TYPE i,
    END OF foo.`;

    const identifier = resolveVariable(abap, "foo");
    const components = expectStructure(identifier);
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("bar");
  });

  it("structured CONSTANTS, BEGIN OF", () => {
    const abap = `
    CONSTANTS:
      BEGIN OF bar,
        foo TYPE c LENGTH 1 VALUE 'a',
      END OF bar.`;

    const identifier = resolveVariable(abap, "bar");
    const components = expectStructure(identifier);
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("foo");
  });

  it("structured CONSTANTS, BEGIN OF, nested", () => {
    const abap = `
    CONSTANTS:
      BEGIN OF bar,
        BEGIN OF loo,
          foo TYPE c LENGTH 1 VALUE 'a',
        END OF loo,
      END OF bar.`;

    const identifier = resolveVariable(abap, "bar");
    const components = expectStructure(identifier);
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("loo");
  });

  it("structured DATA, BEGIN OF, nested", () => {
    const abap = `
    DATA:
      BEGIN OF foo,
        BEGIN OF bar,
          f TYPE string,
        END OF bar,
      END OF foo.`;

    const identifier = resolveVariable(abap, "foo");
    const components = expectStructure(identifier);
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("bar");
  });

});