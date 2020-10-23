import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {Class} from "../../../src/objects";
import {Visibility} from "../../../src/abap/4_file_information/visibility";
import {getABAPObjects} from "../../get_abap";
import {UnknownType} from "../../../src/abap/types/basic";
import {IClassDefinition} from "../../../src/abap/types/_class_definition";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {IRegistry} from "../../../src/_iregistry";
import {MemoryFile} from "../../../src/files/memory_file";

function run(reg: IRegistry): IClassDefinition | undefined {
  const clas = getABAPObjects(reg)[0] as Class;
  const s = new SyntaxLogic(reg, clas).run().spaghetti;
  const scope = s.getTop().getFirstChild();
  return scope?.findClassDefinition(clas.getName());
}

describe("Types, class_definition", () => {

  it("isFinal, negative", () => {
    const abap = "CLASS zcl_moo DEFINITION PUBLIC CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def?.isFinal()).to.equal(false);
  });

  it("isFinal, positive", () => {
    const abap = "CLASS zcl_moo DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.isFinal()).to.equal(true);
  });

  it("getImplementing, empty", () => {
    const abap = "CLASS zcl_moo DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.getImplementing().length).to.equal(0);
  });

  it("getImplementing, single interface", () => {
    const abap = "CLASS zcl_moo DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  public section.\n" +
      "    interfaces zif_moo.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.getImplementing().length).to.equal(1);
    expect(def!.getImplementing()[0].name).to.equal("ZIF_MOO");
    expect(def!.getImplementing()[0].partial).to.equal(false);
  });

  it("method, event handler", () => {
    const abap = "CLASS zcl_moo DEFINITION CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS double_click\n" +
      "      FOR EVENT double_click OF cl_salv_events_table\n" +
      "      IMPORTING !row !column.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "  METHOD double_click.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.getMethodDefinitions()).to.not.equal(undefined);
    const pub = def!.getMethodDefinitions()!.getPublic();
    expect(pub.length).to.equal(1);
    expect(pub[0].isEventHandler()).to.equal(true);
    expect(pub[0]!.getParameters().getAll().length).to.equal(2);
  });

  it("method alias", () => {
    const abap = "CLASS zcl_moo DEFINITION CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    INTERFACES zif_foobar.\n" +
      "    ALIASES: cache_asset FOR zif_foobar~cache_asset.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "  METHOD cache_asset.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    const aliases = def!.getAliases().getAll();
    expect(aliases.length).to.equal(1);
    expect(aliases[0].getName()).to.equal("cache_asset");
    expect(aliases[0].getVisibility()).to.equal(Visibility.Public);
    expect(aliases[0].getComponent()).to.equal("zif_foobar~cache_asset");
  });

  it("method, static", () => {
    const abap = "CLASS zcl_moo DEFINITION CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    CLASS-METHODS moo.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "  METHOD moo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.getMethodDefinitions()).to.not.equal(undefined);
    const pub = def!.getMethodDefinitions()!.getPublic();
    expect(pub.length).to.equal(1);
    expect(pub[0].isStatic()).to.equal(true);
  });

  it("method, local defined type", () => {
    const abap = `
CLASS zcl_moo DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_header,
             field TYPE string,
             value TYPE string,
           END OF ty_header.

    TYPES ty_headers TYPE STANDARD TABLE OF ty_header WITH DEFAULT KEY.

    TYPES: BEGIN OF ty_http,
             headers TYPE ty_headers,
             body    TYPE string,
           END OF ty_http.

    METHODS: moo
      IMPORTING foo TYPE ty_http.
ENDCLASS.
CLASS zcl_moo IMPLEMENTATION.
  METHOD moo.
  ENDMETHOD.
ENDCLASS.`;
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.getMethodDefinitions()).to.not.equal(undefined);
    const pub = def!.getMethodDefinitions()!.getPublic();
    expect(pub.length).to.equal(1);
    const importing = pub[0].getParameters().getImporting();
    expect(importing.length).to.equal(1);
    expect(importing[0].getType()).to.not.be.instanceof(UnknownType);
  });

  it("structured constants values", () => {
    const abap = `CLASS zcl_moo DEFINITION CREATE PUBLIC.
  PUBLIC SECTION.
    CONSTANTS:
      BEGIN OF c_instructions,
        drop   TYPE x VALUE '1A',
        select TYPE x VALUE '1B',
      END OF c_instructions.
ENDCLASS.
CLASS zcl_moo IMPLEMENTATION.
ENDCLASS.`;
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    const found = def?.getAttributes().findByName("c_instructions");
    expect(found).to.not.equal(undefined);
    const value = found?.getValue();
    expect(value).to.not.equal(undefined);
    expect(typeof value).to.equal("object");
  });

});