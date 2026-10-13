import {expect} from "chai";
import {IsAssignedInLoop} from "../../src/rules/is_assigned_in_loop";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {Severity} from "../../src/severity";
import {testRule, testRuleFix} from "./_utils";

const fs = "FIELD-SYMBOLS <style> TYPE any.\n";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

  {abap: fs + `LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 1},
  {abap: fs + `LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  IF <style> IS NOT ASSIGNED.
    CONTINUE.
  ENDIF.
ENDLOOP.`, cnt: 1},
  {abap: fs + `DO 3 TIMES.
  READ TABLE styles ASSIGNING <style> INDEX sy-index.
  CHECK <style> IS ASSIGNED.
ENDDO.`, cnt: 1},
  {abap: fs + `WHILE lv_flag = abap_true.
  ASSIGN (lv_name) TO <style>.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDWHILE.`, cnt: 1},
  {abap: fs + `LOOP AT cells INTO cell.
  ASSIGN COMPONENT cell-name OF STRUCTURE row TO <style>.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 1},
  {abap: fs + `LOOP AT refs INTO ref.
  ASSIGN ref->* TO <style>.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 1},
  {abap: fs + `LOOP AT cells INTO cell.
  ASSIGN styles[ id = cell-style ] TO <style>.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 1},
  {abap: `LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING FIELD-SYMBOL(<style>) WITH KEY id = cell-style.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 1},
  {abap: fs + `LOOP AT cells INTO cell.
  IF cell-style IS NOT INITIAL.
    READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  ENDIF.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 1},
  {abap: fs + `LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  LOOP AT other INTO row.
  ENDLOOP.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 1},
  {abap: fs + `LOOP AT outer INTO row.
  UNASSIGN <style>.
  LOOP AT cells INTO cell.
    READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
    IF <style> IS ASSIGNED.
    ENDIF.
  ENDLOOP.
ENDLOOP.`, cnt: 1},

  {abap: fs + `LOOP AT cells INTO cell.
  UNASSIGN <style>.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 0},
  {abap: fs + `LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  IF sy-subrc = 0.
  ENDIF.
ENDLOOP.`, cnt: 0},
  {abap: fs + `LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  IF sy-subrc = 0 AND <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 0},
  {abap: fs + `READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
IF <style> IS ASSIGNED.
ENDIF.`, cnt: 0},
  {abap: fs + `LOOP AT cells INTO cell.
  ASSIGN cell TO <style>.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 0},
  {abap: fs + `LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
ENDLOOP.
IF <style> IS ASSIGNED.
ENDIF.`, cnt: 0},
  {abap: fs + `LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  UNASSIGN <style>.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 0},
  {abap: fs + `LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  IF <other> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 0},
  {abap: fs + `LOOP AT cells INTO cell.
  READ TABLE styles INTO style WITH KEY id = cell-style.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`, cnt: 0},
];

testRule(tests, IsAssignedInLoop);

const fixes = [
  {
    input: fs + `LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`,
    output: fs + `LOOP AT cells INTO cell.
  UNASSIGN <style>.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`,
  },
  {
    input: fs + `DO 3 TIMES.
  ASSIGN (lv_name) TO <style>.
  CHECK <style> IS ASSIGNED.
ENDDO.`,
    output: fs + `DO 3 TIMES.
  UNASSIGN <style>.
  ASSIGN (lv_name) TO <style>.
  CHECK <style> IS ASSIGNED.
ENDDO.`,
  },
];

testRuleFix(fixes, IsAssignedInLoop);

function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  return new IsAssignedInLoop().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: is_assigned_in_loop, fix and message by shape", () => {

  it("READ TABLE: warning at the check, message names UNASSIGN and sy-subrc", () => {
    const issues = findIssues(fs + `LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING <style> WITH KEY id = cell-style.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(4);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
    expect(issues[0].getMessage()).to.contain("UNASSIGN <style>");
    expect(issues[0].getMessage()).to.contain("sy-subrc");
  });

  it("inline declaration: no quick fix, UNASSIGN before it would not compile", () => {
    const issues = findIssues(`LOOP AT cells INTO cell.
  READ TABLE styles ASSIGNING FIELD-SYMBOL(<style>) WITH KEY id = cell-style.
  IF <style> IS ASSIGNED.
  ENDIF.
ENDLOOP.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getDefaultFix()).to.equal(undefined);
  });

  it("a loop in another method does not count", () => {
    const issues = findIssues(`CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS one.
    METHODS two.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD one.
    DO 3 TIMES.
    ENDDO.
  ENDMETHOD.
  METHOD two.
    FIELD-SYMBOLS <style> TYPE any.
    READ TABLE styles ASSIGNING <style> INDEX 1.
    IF <style> IS ASSIGNED.
    ENDIF.
  ENDMETHOD.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

});
