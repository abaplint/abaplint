import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Class} from "../../src/objects";

describe("Objects, class, isException", () => {

  it("false", () => {
    const reg = new Registry().addFile(new MemoryFile("cl_foo.clas.abap", "foo bar"));
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.isException()).to.equal(false);
  });

  it("true", () => {
    const reg = new Registry().addFile(new MemoryFile("zcx_foo.clas.abap", "foo bar"));
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.isException()).to.equal(true);
  });

});

describe("Objects, class, getName", () => {

  it("test", () => {
    const abap = "class zcl_name definition public create public.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_name IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_name.clas.abap", abap)).parse();
    const obj = reg.getObjects()[0];
    expect(obj.getName()).to.equal("ZCL_NAME");
  });

});

describe("Objects, class, getSuperClass", () => {

  it("test, positive", () => {
    const abap = "class ZCL_WITH_SUPER definition public inheriting from ZCL_SUPER final create public.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_WITH_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getSuperClass()).to.equal("ZCL_SUPER");
  });


  it("test, negative", () => {
    const abap = "class ZCL_WITH_SUPER definition public final create public.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_WITH_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getSuperClass()).to.equal(undefined);
  });

  it("test, parser error", () => {
    const abap = "parser error";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getSuperClass()).to.equal(undefined);
  });

});