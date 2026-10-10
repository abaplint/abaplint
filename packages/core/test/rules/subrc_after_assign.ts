import {expect} from "chai";
import {SubrcAfterAssign} from "../../src/rules/subrc_after_assign";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {Severity} from "../../src/severity";
import {testRule, testRuleFix} from "./_utils";

const fs = "FIELD-SYMBOLS <attri> TYPE any.\n";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

  {abap: fs + `ASSIGN (lv_name) TO <attri>.
IF sy-subrc = 0.
ENDIF.`, cnt: 1},
  {abap: fs + `ASSIGN (lv_name) TO <attri>.
IF sy-subrc <> 0.
  RETURN.
ENDIF.`, cnt: 1},
  {abap: fs + `ASSIGN (lv_name) TO <attri>.
ASSERT sy-subrc = 0.`, cnt: 1},
  {abap: fs + `ASSIGN (lv_name) TO <attri>.
* comment
CHECK sy-subrc = 0.`, cnt: 1},
  {abap: fs + `ASSIGN (lv_name) TO <attri>.
IF sy-subrc = 0 AND <attri> = abap_true.
ENDIF.`, cnt: 1},
  {abap: `ASSIGN lv_value TO FIELD-SYMBOL(<attri>).
IF sy-subrc = 0.
ENDIF.`, cnt: 1},
  {abap: fs + `IF lv_flag = abap_true.
  ASSIGN (lv_name) TO <attri>.
ENDIF.
IF sy-subrc = 0.
ENDIF.`, cnt: 1},
  {abap: fs + `LOOP AT tab INTO row.
  ASSIGN (lv_name) TO <attri>.
  IF sy-subrc = 0.
  ENDIF.
ENDLOOP.`, cnt: 1},
  {abap: fs + `ASSIGN (first) TO <attri>.
IF <attri> IS ASSIGNED.
ENDIF.
ASSIGN (second) TO <attri>.
IF sy-subrc = 0.
ENDIF.`, cnt: 1},

  {abap: fs + `ASSIGN (lv_name) TO <attri>.
IF <attri> IS ASSIGNED.
ENDIF.`, cnt: 0},
  {abap: fs + `ASSIGN (lv_name) TO <attri>.
IF <attri> IS NOT ASSIGNED.
  RETURN.
ENDIF.`, cnt: 0},
  {abap: fs + `ASSIGN COMPONENT lv_name OF STRUCTURE ls_data TO <attri>.
IF sy-subrc = 0.
ENDIF.`, cnt: 0},
  {abap: fs + `ASSIGN COMPONENT 1 OF STRUCTURE ls_data TO <attri>.
IF sy-subrc <> 0.
  RETURN.
ENDIF.`, cnt: 0},
  {abap: `READ TABLE tab INTO row INDEX 1.
IF sy-subrc = 0.
ENDIF.`, cnt: 0},
  {abap: fs + `ASSIGN (lv_name) TO <attri>.
READ TABLE tab INTO row INDEX 1.
IF sy-subrc = 0.
ENDIF.`, cnt: 0},
  {abap: fs + `ASSIGN (lv_name) TO <attri>.
WRITE 'hello'.
IF sy-subrc = 0.
ENDIF.`, cnt: 0},
  {abap: fs + `ASSIGN (lv_name) TO <attri>.
WRITE 'hello'.`, cnt: 0},
];

testRule(tests, SubrcAfterAssign);

const fixes = [
  {
    input: fs + `ASSIGN (lv_name) TO <attri>.
IF sy-subrc = 0.
ENDIF.`,
    output: fs + `ASSIGN (lv_name) TO <attri>.
IF <attri> IS ASSIGNED.
ENDIF.`,
  },
  {
    input: fs + `ASSIGN (lv_name) TO <attri>.
IF sy-subrc <> 0.
  RETURN.
ENDIF.`,
    output: fs + `ASSIGN (lv_name) TO <attri>.
IF <attri> IS NOT ASSIGNED.
  RETURN.
ENDIF.`,
  },
  {
    input: fs + `ASSIGN (lv_name) TO <attri>.
IF sy-subrc = 0 AND lv_flag = abap_true.
ENDIF.`,
    output: fs + `ASSIGN (lv_name) TO <attri>.
IF <attri> IS ASSIGNED AND lv_flag = abap_true.
ENDIF.`,
  },
  {
    input: `ASSIGN lv_value TO FIELD-SYMBOL(<attri>).
ASSERT sy-subrc = 0.`,
    output: `ASSIGN lv_value TO FIELD-SYMBOL(<attri>).
ASSERT <attri> IS ASSIGNED.`,
  },
];

testRuleFix(fixes, SubrcAfterAssign);

function findIssues(abap: string, filename = "zfoo.clas.abap") {
  const reg = new Registry().addFile(new MemoryFile(filename, abap)).parse();
  return new SubrcAfterAssign().initialize(reg).run(reg.getFirstObject()!);
}

function method(body: string) {
  return `CLASS zfoo DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS run IMPORTING name TYPE string.
ENDCLASS.
CLASS zfoo IMPLEMENTATION.
  METHOD run.
${body}
  ENDMETHOD.
ENDCLASS.`;
}

describe("Rule: subrc_after_assign, fix and message by shape", () => {

  it("simple shape: quick fix, warning", () => {
    const issues = findIssues(method(`    FIELD-SYMBOLS <attri> TYPE any.
    ASSIGN (name) TO <attri>.
    IF sy-subrc <> 0.
      RETURN.
    ENDIF.`));
    expect(issues.length).to.equal(1);
    expect(issues[0].getDefaultFix()).to.not.equal(undefined);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("inside a loop: no quick fix, message names UNASSIGN", () => {
    const issues = findIssues(method(`    FIELD-SYMBOLS <attri> TYPE any.
    DO 3 TIMES.
      ASSIGN (name) TO <attri>.
      IF sy-subrc <> 0.
        RETURN.
      ENDIF.
    ENDDO.`));
    expect(issues.length).to.equal(1);
    expect(issues[0].getDefaultFix()).to.equal(undefined);
    expect(issues[0].getMessage()).to.contain("UNASSIGN <attri>");
  });

  it("bound earlier by LOOP ASSIGNING: no quick fix", () => {
    const issues = findIssues(method(`    DATA tab TYPE STANDARD TABLE OF string WITH EMPTY KEY.
    FIELD-SYMBOLS <attri> TYPE any.
    LOOP AT tab ASSIGNING <attri>.
    ENDLOOP.
    ASSIGN (name) TO <attri>.
    IF sy-subrc <> 0.
      RETURN.
    ENDIF.`));
    expect(issues.length).to.equal(1);
    expect(issues[0].getDefaultFix()).to.equal(undefined);
    expect(issues[0].getMessage()).to.contain("UNASSIGN <attri>");
  });

  it("an ASSIGN in another method does not count as bound earlier", () => {
    const abap = `CLASS zfoo DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS one IMPORTING name TYPE string.
    METHODS two IMPORTING name TYPE string.
ENDCLASS.
CLASS zfoo IMPLEMENTATION.
  METHOD one.
    FIELD-SYMBOLS <attri> TYPE any.
    ASSIGN (name) TO <attri>.
  ENDMETHOD.
  METHOD two.
    FIELD-SYMBOLS <attri> TYPE any.
    ASSIGN (name) TO <attri>.
    IF sy-subrc <> 0.
      RETURN.
    ENDIF.
  ENDMETHOD.
ENDCLASS.`;
    const issues = findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getDefaultFix()).to.not.equal(undefined);
  });

  it("not declared in the method: no quick fix", () => {
    const issues = findIssues(`FIELD-SYMBOLS <attri> TYPE any.
FORM run USING name TYPE string.
  ASSIGN (name) TO <attri>.
  IF sy-subrc <> 0.
    RETURN.
  ENDIF.
ENDFORM.`, "zfoo.prog.abap");
    expect(issues.length).to.equal(1);
    expect(issues[0].getDefaultFix()).to.equal(undefined);
    expect(issues[0].getMessage()).to.contain("not declared in this method");
  });

  it("a comparison to another value: reported, no quick fix", () => {
    const issues = findIssues(method(`    FIELD-SYMBOLS <attri> TYPE any.
    ASSIGN (name) TO <attri>.
    IF sy-subrc = 4.
      RETURN.
    ENDIF.`));
    expect(issues.length).to.equal(1);
    expect(issues[0].getDefaultFix()).to.equal(undefined);
  });

});
