import {expect} from "chai";
import {UnusedTypes} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";

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

});
