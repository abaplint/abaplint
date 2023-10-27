import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {SlowParameterPassing} from "../../src/rules";

async function findIssues(abap: string, filename: string) {
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new SlowParameterPassing();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: slow_parameter_passing", () => {

  it("parser error", async () => {
    const abap = `sdfsdfsdfsdf.`;
    const issues = await findIssues(abap, "zslowpass.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("one issue", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS bar IMPORTING VALUE(sdf) TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD bar.
    WRITE sdf.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap, "zslowpass.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("no issue, write position", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS bar IMPORTING VALUE(sdf) TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD bar.
    CLEAR sdf.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap, "zslowpass.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("fixed", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS bar IMPORTING sdf TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD bar.
    WRITE sdf.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap, "zslowpass.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("one issue, static method", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING VALUE(sdf) TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD bar.
    WRITE sdf.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap, "zslowpass.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("changed in loop, no issue expected", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty TYPE STANDARD TABLE OF i WITH EMPTY KEY.
    METHODS foo IMPORTING VALUE(tab) TYPE ty.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    LOOP AT tab ASSIGNING FIELD-SYMBOL(<sdf>).
      <sdf> = 2.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap, "zslowpass.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("intf, two implementations", async () => {
    const abap = `
INTERFACE lif.
  METHODS moo IMPORTING VALUE(val) TYPE i.
ENDINTERFACE.

CLASS lcl1 DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
ENDCLASS.

CLASS lcl1 IMPLEMENTATION.
  METHOD lif~moo.
    CLEAR val.
  ENDMETHOD.
ENDCLASS.

CLASS lcl2 DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
ENDCLASS.

CLASS lcl2 IMPLEMENTATION.
  METHOD lif~moo.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap, "zslowpass.prog.abap");
    expect(issues.length).to.equal(0);
  });

});