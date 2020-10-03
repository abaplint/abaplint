import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {OmitParameterName} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string, filename: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new OmitParameterName();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: omit_parameter_name", () => {
  it("parser error", async () => {
    const abap = "parser error";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("simple, one parameter", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING imp TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  lcl_bar=>bar( imp = 2 ).
ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("simple, one parameter, local data same name as parameter", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING imp TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  DATA imp TYPE i.
  lcl_bar=>bar( imp ).
ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("fixed", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING imp TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  lcl_bar=>bar( 2 ).
ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("simple, two OPTIONAL parameters", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING
      imp TYPE i OPTIONAL
      imp2 TYPE i OPTIONAL.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  lcl_bar=>bar( imp = 2 ).
ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

});