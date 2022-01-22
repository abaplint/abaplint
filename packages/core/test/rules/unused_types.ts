import {expect} from "chai";
import {UnusedTypes} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {IFile} from "../../src/files/_ifile";

async function runMulti(files: IFile[]): Promise<Issue[]> {
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  return new UnusedTypes().initialize(reg).run(reg.getFirstObject()!);
}

async function runSingle(abap: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  return new UnusedTypes().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: unused_types, single file", () => {

  it("test1", async () => {
    const abap = "parser error";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test2", async () => {
    const abap = "parser error.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test3", async () => {
    const abap = "WRITE bar.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test4", async () => {
    const abap = "TYPES bar TYPE c LENGTH 1.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("pragma'ed", async () => {
    const abap = "TYPES bar TYPE c LENGTH 1 ##NEEDED.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("two unused", async () => {
    const abap = `
    TYPES foo TYPE c LENGTH 1.
    TYPES bar TYPE c LENGTH 1.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(2);
  });

  it("test5", async () => {
    const abap = `
    TYPES bar TYPE c LENGTH 1.
    DATA foo TYPE bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("local type definition, used", async () => {
    const abap = `
    FORM foobar.
      TYPES bar TYPE c LENGTH 1.
      DATA foo TYPE bar.
    ENDFORM.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("local type definition, unused", async () => {
    const abap = `
    FORM foobar.
      TYPES bar TYPE c LENGTH 1.
    ENDFORM.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("local interface", async () => {
    const abap = `
INTERFACE lif_package_interface_facade.
  TYPES ty_tpak_package_interf_elem_tt TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  METHODS:
    get_elements
      RETURNING
        VALUE(rt_elements) TYPE ty_tpak_package_interf_elem_tt.
ENDINTERFACE.

CLASS lcl_package_interface_facade DEFINITION.
  PUBLIC SECTION.
    INTERFACES:
      lif_package_interface_facade.
ENDCLASS.

CLASS lcl_package_interface_facade IMPLEMENTATION.
  METHOD lif_package_interface_facade~get_elements.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("local class, one issue expected", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    TYPES ty_bar TYPE c LENGTH 1.
    METHODS: method1, method2.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD method1.
  ENDMETHOD.
  METHOD method2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("local class, used, method1", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    TYPES ty_bar TYPE c LENGTH 1.
    METHODS: method1, method2.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD method1.
    DATA foo TYPE ty_bar.
  ENDMETHOD.
  METHOD method2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("local class, used, method2", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    TYPES ty_bar TYPE c LENGTH 1.
    METHODS: method1, method2.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD method1.
  ENDMETHOD.
  METHOD method2.
    DATA foo TYPE ty_bar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("referenced via class prefix", async () => {
    const abap = `
CLASS lcl_class DEFINITION.
  PUBLIC SECTION.
    TYPES ty_bar TYPE string.
    METHODS m RETURNING VALUE(asdf) TYPE lcl_class=>ty_bar.
ENDCLASS.
CLASS lcl_class IMPLEMENTATION.
  METHOD m.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("two classes", async () => {
    const abap1 = `
CLASS zcl_wast_parser DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PRIVATE SECTION.
    METHODS instructions
      RETURNING
        VALUE(rt_instructions) TYPE zcl_wasm_instructions=>ty_instructions .
ENDCLASS.
CLASS zcl_wast_parser IMPLEMENTATION.
  METHOD instructions.
  ENDMETHOD.
ENDCLASS.`;
    const abap2 = `
CLASS zcl_wasm_instructions DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    TYPES ty_instruction TYPE x LENGTH 1.
    TYPES ty_instructions TYPE STANDARD TABLE OF ty_instruction WITH EMPTY KEY.
ENDCLASS.

CLASS ZCL_WASM_INSTRUCTIONS IMPLEMENTATION.
ENDCLASS.`;
    const files = [
      new MemoryFile("zcl_wasm_instructions.clas.abap", abap2),
      new MemoryFile("zcl_wast_parser.clas.abap", abap1),
    ];
    // note that only the issues for the first file is returned
    const issues = await runMulti(files);
    expect(issues.length).to.equal(0);
  });

  it("BEGIN END, should not have quick fix", async () => {
    const abap = `
    TYPES: BEGIN OF ty_includes,
             programm TYPE programm,
           END OF ty_includes.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getFix()).to.equal(undefined);
  });

  it("INCLUDE TYPE 1", async () => {
    const abap = `
    TYPES ty_test TYPE i.
    TYPES: BEGIN OF ty_msg.
    TYPES: test TYPE ty_test.
        INCLUDE TYPE symsg.
    TYPES END OF ty_msg.
    DATA foo TYPE ty_msg.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("INCLUDE TYPE 2, after", async () => {
    const abap = `
    TYPES ty_test TYPE i.
    TYPES: BEGIN OF ty_msg.
    INCLUDE TYPE symsg.
    TYPES: test TYPE ty_test.
    TYPES END OF ty_msg.
    DATA foo TYPE ty_msg.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("ENUM BASE TYPE", async () => {
    const abap = `
  TYPES:
  category_base TYPE n LENGTH 2,
  BEGIN OF ENUM category BASE TYPE category_base,
    sdfsd VALUE IS INITIAL,
    fdsfd VALUE '01',
  END OF ENUM category.
DATA foo TYPE category.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("DATA BEGIN OF, and INCLUDE TYPE", async () => {
    const abap = `
  TYPES: BEGIN OF incl,
  fieldname(30),
  END OF incl.

DATA BEGIN OF x031l.
INCLUDE TYPE incl.
DATA END OF x031l.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

});
