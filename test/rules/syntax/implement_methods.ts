import {expect} from "chai";
import {ImplementMethods} from "../../../src/rules";
import {Registry} from "../../../src/registry";
import {MemoryFile} from "../../../src/files";
import {Issue} from "../../../src/issue";

function runMulti(files: {filename: string, contents: string}[]): Issue[] {
  const reg = new Registry();
  for (const file of files) {
    reg.addFile(new MemoryFile(file.filename, file.contents));
  }
  reg.parse();
  let issues: Issue[] = [];
  for (const obj of reg.getObjects()) {
    issues = issues.concat(new ImplementMethods().run(obj, reg));
  }
  return issues;
}

describe("Rules, implement_methods", function () {
  it("parser error", () => {
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents: "parase error"}]);
    expect(issues.length).to.equals(0);
  });

  it("normal class, no methods", () => {
    const contents =
    `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
     ENDCLASS.
     CLASS zcl_foobar IMPLEMENTATION.
     ENDCLASS.`;
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("local class, implementation part not found", () => {
    const contents =
    `REPORT zrep.
     CLASS lcl_foobar DEFINITION.
     ENDCLASS.`;
    const issues = runMulti([{filename: "zrep.prog.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("normal class, missing implementation", () => {
    const contents =
    `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          METHODS foobar.
     ENDCLASS.
     CLASS zcl_foobar IMPLEMENTATION.
     ENDCLASS.`;
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("normal class, method implemented", () => {
    const contents =
    `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
       PUBLIC SECTION.
         METHODS foobar.
     ENDCLASS.
     CLASS zcl_foobar IMPLEMENTATION.
       METHOD foobar.
       ENDMETHOD.
      ENDCLASS.`;
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("abstract method", () => {
    const contents =
    `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
      PUBLIC SECTION.
        METHODS foobar ABSTRACT.
     ENDCLASS.
     CLASS zcl_foobar IMPLEMENTATION.
     ENDCLASS.`;
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("abstract method, do not implement", () => {
    const contents = `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          METHODS foobar ABSTRACT.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
        METHOD foobar.
        ENDMETHOD.
      ENDCLASS.`;
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("global class with local classes", () => {
    const main = `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
      ENDCLASS.`;
    const imp = `CLASS lcl_foo IMPLEMENTATION.
      ENDCLASS.`;
    const def = `CLASS lcl_foo DEFINITION.
      ENDCLASS.`;
    const issues = runMulti([
      {filename: "zcl_foobar.clas.locals_imp.abap", contents: imp},
      {filename: "zcl_foobar.clas.locals_def.abap", contents: def},
      {filename: "zcl_foobar.clas.abap", contents: main},
    ]);
    expect(issues.length).to.equals(0);
  });

  it("implemented interface not found", () => {
    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          INTERFACES: zif_bar.
      ENDCLASS.
      CLASS zcl_foo IMPLEMENTATION.
      ENDCLASS.`;
    const issues = runMulti([
      {filename: "zcl_foo.clas.abap", contents: clas}]);
    expect(issues.length).to.equals(1);
  });

  it("implement methods from interface, error, not implemented", () => {
    const intf = `INTERFACE zif_bar PUBLIC.
        METHODS: foobar.
      ENDINTERFACE.\n`;
    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          INTERFACES: zif_bar.
      ENDCLASS.
      CLASS zcl_foo IMPLEMENTATION.
      ENDCLASS.`;
    const issues = runMulti([
      {filename: "zcl_foo.clas.abap", contents: clas},
      {filename: "zif_bar.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(1);
  });

  it("interface contains syntax error, ignore", () => {
    const intf = `INTERFsdffsdACE zif_bar PUBLIC.
        METHODS: foobar.
      ENDINTERFACE.\n`;
    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          INTERFACES: zif_bar.
      ENDCLASS.
      CLASS zcl_foo IMPLEMENTATION.
      ENDCLASS.`;
    const issues = runMulti([
      {filename: "zcl_foo.clas.abap", contents: clas},
      {filename: "zif_bar.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(0);
  });

  it("implement methods from interface, implemented", () => {
    const intf = `INTERFACE zif_bar PUBLIC.
        METHODS: foobar.
      ENDINTERFACE.\n`;
    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          INTERFACES: zif_bar.
      ENDCLASS.
      CLASS zcl_foo IMPLEMENTATION.
        METHOD zif_bar~foobar.
        ENDMETHOD.
      ENDCLASS.`;
    const issues = runMulti([
      {filename: "zcl_foo.clas.abap", contents: clas},
      {filename: "zif_bar.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(0);
  });

  it("implement methods from interface, implemented by ALIAS", () => {
    const intf =
    `INTERFACE zif_bar PUBLIC.
        METHODS: foobar.
      ENDINTERFACE.\n`;
    const clas =
    `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          INTERFACES: zif_bar.
          ALIASES: foobar FOR zif_bar~foobar.
      ENDCLASS.
      CLASS zcl_foo IMPLEMENTATION.
        METHOD foobar.
        ENDMETHOD.
      ENDCLASS.`;
    const issues = runMulti([
      {filename: "zcl_foo.clas.abap", contents: clas},
      {filename: "zif_bar.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(0);
  });

  it("PROG, local intf and class", () => {
    const prog = `
    REPORT zfoobar.
    INTERFACE zif_bar.
    ENDINTERFACE.
    CLASS zcl_foo DEFINITION.
      PUBLIC SECTION.
        INTERFACES: zif_bar.
    ENDCLASS.
    CLASS zcl_foo IMPLEMENTATION.
    ENDCLASS.`;
    const issues = runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues.length).to.equals(0);
  });

  it("PROG, local intf and class, partially implemented", () => {
    const prog = `
    INTERFACE lif_foo.
      METHODS method1.
    ENDINTERFACE.
    CLASS ltcl_bar DEFINITION FOR TESTING.
      PUBLIC SECTION.
        INTERFACES lif_foo PARTIALLY IMPLEMENTED.
    ENDCLASS.
    CLASS ltcl_bar IMPLEMENTATION.
    ENDCLASS.`;
    const issues = runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues.length).to.equals(0);
  });

});