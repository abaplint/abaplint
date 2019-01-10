import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {Class} from "../../../src/objects";

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

});