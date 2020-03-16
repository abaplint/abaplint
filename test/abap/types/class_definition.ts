import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {Class} from "../../../src/objects";
import {Visibility} from "../../../src/abap/types/visibility";
import {CurrentScope} from "../../../src/abap/syntax/_current_scope";

describe("Types, class_definition", () => {

  it("isFinal, negative", () => {
    const abap = "CLASS zcl_moo DEFINITION PUBLIC CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.isFinal()).to.equal(false);
  });

  it("isFinal, positive", () => {
    const abap = "CLASS zcl_moo DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.isFinal()).to.equal(true);
  });

  it("getImplementing, empty", () => {
    const abap = "CLASS zcl_moo DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.getImplementing().length).to.equal(0);
  });

  it("getImplementing, single interface", () => {
    const abap = "CLASS zcl_moo DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  public section.\n" +
      "    interfaces zif_moo.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_moo.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.getImplementing().length).to.equal(1);
    expect(clas.getClassDefinition()!.getImplementing()[0].name).to.equal("ZIF_MOO");
    expect(clas.getClassDefinition()!.getImplementing()[0].partial).to.equal(false);
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
    const scope = CurrentScope.buildDefault(reg);
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.getMethodDefinitions(scope)).to.not.equal(undefined);
    const pub = clas.getClassDefinition()!.getMethodDefinitions(scope)!.getPublic();
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
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    const aliases = clas.getClassDefinition()!.getAliases().getAll();
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
    const scope = CurrentScope.buildDefault(reg);
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.getMethodDefinitions(scope)).to.not.equal(undefined);
    const pub = clas.getClassDefinition()!.getMethodDefinitions(scope)!.getPublic();
    expect(pub.length).to.equal(1);
    expect(pub[0].isStatic()).to.equal(true);
  });

});