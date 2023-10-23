import {expect} from "chai";
import {ImplementMethods} from "../../src/rules";
import {Registry} from "../../src/registry";
import {Issue} from "../../src/issue";
import {MemoryFile} from "../../src/files/memory_file";
import {testRuleFixSingle} from "./_utils";

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

function testFix(input: string, expected: string) {
  testRuleFixSingle(input, expected, new ImplementMethods());
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
    expect(issues.length).to.equals(1);
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

  it("PROG, interfaced interface, fixed", async () => {
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
  METHOD lif_top~moo.
    RETURN.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues.length).to.equals(0);
  });

  it("PROG, no problems, interfaced interface implemented in super class", async () => {
    const prog = `
INTERFACE lif_top.
  METHODS moo.
ENDINTERFACE.

INTERFACE lif_sub.
  INTERFACES lif_top.
ENDINTERFACE.

CLASS lcl_super DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_top.
ENDCLASS.

CLASS lcl_super IMPLEMENTATION.
  METHOD lif_top~moo.
  ENDMETHOD.
ENDCLASS.

CLASS lcl_clas DEFINITION INHERITING FROM lcl_super.
  PUBLIC SECTION.
    INTERFACES lif_sub.
ENDCLASS.

CLASS lcl_clas IMPLEMENTATION.
ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues.length).to.equals(0);
  });

  it("ALL METHODS ABSTRACT", async () => {
    const prog = `
INTERFACE lif_bar.
  METHODS m1.
ENDINTERFACE.

CLASS lcl_foo DEFINITION ABSTRACT.
  PUBLIC SECTION.
    INTERFACES lif_bar ALL METHODS ABSTRACT.
ENDCLASS.

CLASS lcl_foo IMPLEMENTATION.
ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues.length).to.equals(0);
  });

  it("ALIASed in interface", async () => {
    const prog = `
INTERFACE lif_writer.
  METHODS stringify.
ENDINTERFACE.

INTERFACE lif_json.
  INTERFACES lif_writer.
  ALIASES stringify FOR lif_writer~stringify.
ENDINTERFACE.

CLASS lcl_json DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_json.
ENDCLASS.

CLASS lcl_json IMPLEMENTATION.
  METHOD lif_json~stringify.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues.length).to.equals(0);
  });

  it("normal class, quickfix", async () => {
    const abap = `CLASS zcl_foobar DEFINITION.
  PUBLIC SECTION.
    METHODS foobar.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;

    const expected = `CLASS zcl_foobar DEFINITION.
  PUBLIC SECTION.
    METHODS foobar.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD foobar.
    RETURN. " todo, implement method
  ENDMETHOD.
ENDCLASS.`;
    testFix(abap, expected);
  });

  it("ALIASes, should be case insensitive", async () => {
    const prog = `
INTERFACE top.
  METHODS get_parameter_list IMPORTING int TYPE i.
ENDINTERFACE.

INTERFACE sub.
  INTERFACES top.
  ALIASES get_parameter_list FOR TOP~get_parameter_list.
ENDINTERFACE.

CLASS clas DEFINITION.
  PUBLIC SECTION.
    INTERFACES sub.
ENDCLASS.
CLASS clas IMPLEMENTATION.
  METHOD sub~get_parameter_list.
    WRITE int.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("ALIASes and super class", async () => {
    const prog = `
INTERFACE lif_entity.
  METHODS get_foo.
ENDINTERFACE.

INTERFACE lif_request.
  INTERFACES lif_entity.
  ALIASES get_foo FOR lif_entity~get_foo.
ENDINTERFACE.

CLASS lcl_entity DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_entity.
ENDCLASS.

CLASS lcl_entity IMPLEMENTATION.
  METHOD lif_entity~get_foo.
  ENDMETHOD.
ENDCLASS.

CLASS lcl_sub DEFINITION INHERITING FROM lcl_entity.
  PUBLIC SECTION.
    INTERFACES lif_request.
ENDCLASS.

CLASS lcl_sub IMPLEMENTATION.
ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("no class implementations needed", async () => {
    const prog = `
CLASS zcl_mockup_loader_stub_base DEFINITION.
ENDCLASS.

CLASS lcl_mockup_loader_stub_final DEFINITION FINAL
  INHERITING FROM zcl_mockup_loader_stub_base.
ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("no class implementations needed, simple", async () => {
    const prog = `
CLASS zcl_mockup_loader_stub_base DEFINITION.
ENDCLASS.
`;
    const issues = await runMulti([
      {filename: "zfoobar.prog.abap", contents: prog}]);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("single include, no main program", async () => {
    const prog = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_bar.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.`;

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZINCLINTF</NAME>
    <SUBC>I</SUBC>
    <RLOAD>E</RLOAD>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
   <TPOOL>
    <item>
     <ID>R</ID>
     <ENTRY>include</ENTRY>
     <LENGTH>7</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runMulti([
      {filename: "zinclintf.prog.abap", contents: prog},
      {filename: "zinclintf.prog.xml", contents: xml},
    ]);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("works with missing aliases", async () => {
    const issues = await runMulti([
      {
        filename: "cl_foo.clas.abap",
        contents: `CLASS lcl DEFINITION.
    PUBLIC SECTION.
      ALIASES blah FOR zlif~blah.
  ENDCLASS.
  
  CLASS lcl IMPLEMENTATION.
  ENDCLASS.`,
      },
    ]);
    expect(issues.length).to.equals(1);
  });
});