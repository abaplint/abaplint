import {expect} from "chai";
import {ImplementMethods} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";
import {Issue} from "../../src/issue";

async function runMulti(files: {filename: string, contents: string}[]): Promise<Issue[]> {
  const reg = new Registry();
  for (const file of files) {
    reg.addFile(new MemoryFile(file.filename, file.contents));
  }
  await reg.parseAsync();
  let issues: Issue[] = [];
  for (const obj of reg.getObjects()) {
    issues = issues.concat(new ImplementMethods().initialize(reg).run(obj));
  }
  return issues;
}

describe("Rules, implement_methods", () => {
  it("parser error", async () => {
    const issues = await runMulti([{filename: "cl_foo.clas.abap", contents: "parase error"}]);
    expect(issues.length).to.equals(0);
  });

  it("normal class, no methods", async () => {
    const contents =
    `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
     ENDCLASS.
     CLASS zcl_foobar IMPLEMENTATION.
     ENDCLASS.`;
    const issues = await runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("local class, implementation part not found", async () => {
    const contents =
    `REPORT zrep.
     CLASS lcl_foobar DEFINITION.
     ENDCLASS.`;
    const issues = await runMulti([{filename: "zrep.prog.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("normal class, missing implementation", async () => {
    const contents =
    `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          METHODS foobar.
     ENDCLASS.
     CLASS zcl_foobar IMPLEMENTATION.
     ENDCLASS.`;
    const issues = await runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("normal class, method implemented", async () => {
    const contents =
    `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
       PUBLIC SECTION.
         METHODS foobar.
     ENDCLASS.
     CLASS zcl_foobar IMPLEMENTATION.
       METHOD foobar.
       ENDMETHOD.
      ENDCLASS.`;
    const issues = await runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("abstract method", async () => {
    const contents =
    `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
      PUBLIC SECTION.
        METHODS foobar ABSTRACT.
     ENDCLASS.
     CLASS zcl_foobar IMPLEMENTATION.
     ENDCLASS.`;
    const issues = await runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("abstract method, do not implement", async () => {
    const contents = `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          METHODS foobar ABSTRACT.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
        METHOD foobar.
        ENDMETHOD.
      ENDCLASS.`;
    const issues = await runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("global class with local classes", async () => {
    const main = `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
      ENDCLASS.`;
    const imp = `CLASS lcl_foo IMPLEMENTATION.
      ENDCLASS.`;
    const def = `CLASS lcl_foo DEFINITION.
      ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zcl_foobar.clas.locals_imp.abap", contents: imp},
      {filename: "zcl_foobar.clas.locals_def.abap", contents: def},
      {filename: "zcl_foobar.clas.abap", contents: main},
    ]);
    expect(issues.length).to.equals(0);
  });

  it("implemented interface not found", async () => {
    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          INTERFACES: zif_bar.
      ENDCLASS.
      CLASS zcl_foo IMPLEMENTATION.
      ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zcl_foo.clas.abap", contents: clas}]);
    expect(issues.length).to.equals(1);
  });

  it("implement methods from interface, error, not implemented", async () => {
    const intf = `INTERFACE zif_bar PUBLIC.
        METHODS: foobar.
      ENDINTERFACE.\n`;
    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          INTERFACES: zif_bar.
      ENDCLASS.
      CLASS zcl_foo IMPLEMENTATION.
      ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zcl_foo.clas.abap", contents: clas},
      {filename: "zif_bar.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(1);
  });

  it("interface contains syntax error, ignore", async () => {
    const intf = `INTERFsdffsdACE zif_bar PUBLIC.
        METHODS: foobar.
      ENDINTERFACE.\n`;
    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          INTERFACES: zif_bar.
      ENDCLASS.
      CLASS zcl_foo IMPLEMENTATION.
      ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zcl_foo.clas.abap", contents: clas},
      {filename: "zif_bar.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(0);
  });

  it("implement methods from interface, implemented", async () => {
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
    const issues = await runMulti([
      {filename: "zcl_foo.clas.abap", contents: clas},
      {filename: "zif_bar.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(0);
  });

  it("implement methods from interface, implemented by ALIAS", async () => {
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
    const issues = await runMulti([
      {filename: "zcl_foo.clas.abap", contents: clas},
      {filename: "zif_bar.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(0);
  });

  it("PROG, local intf and class", async () => {
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
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues.length).to.equals(0);
  });

  it("PROG, local intf and class, partially implemented", async () => {
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
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues.length).to.equals(0);
  });

  it("INTERFACES ABSTRACT METHODS", async () => {
    const prog = `
INTERFACE lcl_intf.
  METHODS method_name.
ENDINTERFACE.

CLASS lcl_bar DEFINITION ABSTRACT.
  PUBLIC SECTION.
    INTERFACES lcl_intf ABSTRACT METHODS method_name.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues.length).to.equals(0);
  });

  it("class, local interface", async () => {
    const locals = `
    INTERFACE lif_abapgit_provider.
    ENDINTERFACE.`;
    const testclasses = `
    CLASS lcl_test DEFINITION.
      PUBLIC SECTION.
        INTERFACES: lif_abapgit_provider.
    ENDCLASS.
    CLASS lcl_test IMPLEMENTATION.
    ENDCLASS.`;
    const main = `
    CLASS zcl_abapgit_res_repos DEFINITION PUBLIC FINAL CREATE PUBLIC.
    ENDCLASS.
    CLASS zcl_abapgit_res_repos IMPLEMENTATION.
    ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zcl_abapgit_res_repos.clas.locals_def.abap", contents: locals},
      {filename: "zcl_abapgit_res_repos.clas.testclasses.abap", contents: testclasses},
      {filename: "zcl_abapgit_res_repos.clas.abap", contents: main},
    ]);
    expect(issues.length).to.equals(0);
  });

  it("PROG, interfaced interface", async () => {
    const prog = `
INTERFACE lif_top.
  METHODS moo.
ENDINTERFACE.

INTERFACE lif_sub.
  INTERFACES lif_top.
ENDINTERFACE.

CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_sub.
ENDCLASS.

CLASS lcl_clas IMPLEMENTATION.
ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues.length).to.equals(1);
  });

});