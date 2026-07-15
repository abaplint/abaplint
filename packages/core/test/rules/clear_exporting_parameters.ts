import {expect} from "chai";
import {ClearExportingParameters, ClearExportingParametersConf} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";

async function runSingle(abap: string, config?: ClearExportingParametersConf): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zcl_foo.clas.abap", abap));
  await reg.parseAsync();
  const rule = new ClearExportingParameters();
  if (config) {
    rule.setConfig(config);
  }
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

function wrap(body: string, definition = "METHODS foo EXPORTING ev_result TYPE i."): string {
  return `CLASS zcl_foo DEFINITION PUBLIC.
  PUBLIC SECTION.
    ${definition}
ENDCLASS.
CLASS zcl_foo IMPLEMENTATION.
  METHOD foo.
${body}
  ENDMETHOD.
ENDCLASS.`;
}

describe("Rule: clear_exporting_parameters", () => {

  it("parser error, no issues", async () => {
    const issues = await runSingle("parser error.");
    expect(issues.length).to.equal(0);
  });

  it("read before write (self assignment), issue", async () => {
    const issues = await runSingle(wrap("    ev_result = ev_result + 1."));
    expect(issues.length).to.equal(1);
  });

  it("read in earlier statement, issue", async () => {
    const issues = await runSingle(wrap("    DATA(lv_copy) = ev_result.\n    ev_result = lv_copy + 1."));
    expect(issues.length).to.equal(1);
  });

  it("CLEAR before read, no issue", async () => {
    const issues = await runSingle(wrap("    CLEAR ev_result.\n    ev_result = ev_result + 1."));
    expect(issues.length).to.equal(0);
  });

  it("write before read, no issue", async () => {
    const issues = await runSingle(wrap("    ev_result = 1.\n    ev_result = ev_result + 1."));
    expect(issues.length).to.equal(0);
  });

  it("plain assignment only, no issue", async () => {
    const issues = await runSingle(wrap("    ev_result = 1."));
    expect(issues.length).to.equal(0);
  });

  it("never touched, no issue (handled by unused_variables)", async () => {
    const issues = await runSingle(wrap("    RETURN."));
    expect(issues.length).to.equal(0);
  });

  it("pass by value, no issue", async () => {
    const def = "METHODS foo EXPORTING VALUE(ev_result) TYPE i.";
    const issues = await runSingle(wrap("    ev_result = ev_result + 1.", def));
    expect(issues.length).to.equal(0);
  });

  it("importing parameter, no issue", async () => {
    const def = "METHODS foo IMPORTING iv_input TYPE i EXPORTING ev_result TYPE i.";
    const issues = await runSingle(wrap("    ev_result = iv_input.", def));
    expect(issues.length).to.equal(0);
  });

  it("changing parameter, no issue", async () => {
    const def = "METHODS foo CHANGING cv_value TYPE i.";
    const issues = await runSingle(wrap("    cv_value = cv_value + 1.", def));
    expect(issues.length).to.equal(0);
  });

  it("skipNames config, no issue", async () => {
    const config = new ClearExportingParametersConf();
    config.skipNames = ["ev_result"];
    const issues = await runSingle(wrap("    ev_result = ev_result + 1."), config);
    expect(issues.length).to.equal(0);
  });

  it("read in nested control structure, issue", async () => {
    const body = `    IF 1 = 1.
      ev_result = ev_result + 1.
    ENDIF.`;
    const issues = await runSingle(wrap(body));
    expect(issues.length).to.equal(1);
  });

  it("cleared inside method, table appended, no issue", async () => {
    const def = `TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    METHODS foo EXPORTING et_tab TYPE ty_tab.`;
    const body = `    CLEAR et_tab.
    APPEND 1 TO et_tab.`;
    const issues = await runSingle(wrap(body, def));
    expect(issues.length).to.equal(0);
  });

  it("read via WRITE before assigned, issue", async () => {
    const issues = await runSingle(wrap("    WRITE ev_result.\n    ev_result = 1."));
    expect(issues.length).to.equal(1);
  });

});
