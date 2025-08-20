import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {Issue} from "../../../src/issue";
import {MemoryFile} from "../../../src/files/memory_file";
import {getABAPObjects} from "../../get_abap";

function runProgram(abap: string): Issue[] {
  const file = new MemoryFile("zfoobar.prog.abap", abap);
  const reg = new Registry().addFile(file);
  reg.parse();
  
  let ret: Issue[] = [];
  for (const obj of getABAPObjects(reg)) {
    ret = ret.concat(new SyntaxLogic(reg, obj).run().issues);
  }
  return ret;
}

describe("Continue syntax check", () => {
  it("should report error for CONTINUE outside loop", () => {
    const abap = "CONTINUE.";
    const issues = runProgram(abap);
    
    const continueIssues = issues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(1);
    expect(continueIssues[0].getMessage()).to.include("CONTINUE is not allowed outside of loops");
  });

  it("should not report error for CONTINUE inside LOOP", () => {
    const abap = `LOOP AT items INTO item.
  CONTINUE.
ENDLOOP.`;
    const issues = runProgram(abap);
    
    const continueIssues = issues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(0);
  });

  it("should not report error for CONTINUE inside DO loop", () => {
    const abap = `DO 10 TIMES.
  CONTINUE.
ENDDO.`;
    const issues = runProgram(abap);
    
    const continueIssues = issues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(0);
  });

  it("should not report error for CONTINUE inside WHILE loop", () => {
    const abap = `WHILE condition = abap_true.
  CONTINUE.
ENDWHILE.`;
    const issues = runProgram(abap);
    
    const continueIssues = issues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(0);
  });

  it("should not report error for CONTINUE inside SELECT loop", () => {
    const abap = `SELECT kunnr FROM kna1 INTO lv_kunnr.
  CONTINUE.
ENDSELECT.`;
    const issues = runProgram(abap);
    
    const continueIssues = issues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(0);
  });

  it("should not report error for CONTINUE inside LOOP AT SCREEN", () => {
    const abap = `LOOP AT SCREEN.
  CONTINUE.
ENDLOOP.`;
    const issues = runProgram(abap);
    
    const continueIssues = issues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(0);
  });

  it("should report error for CONTINUE in CASE outside loop", () => {
    const abap = `CASE abap_true.
  WHEN 'X'.
    CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
  WHEN OTHERS.
    CONTINUE.
ENDCASE.`;
    const issues = runProgram(abap);
    
    const continueIssues = issues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(1);
  });

  it("should report error for CONTINUE in IF outside loop", () => {
    const abap = `IF abap_true = abap_true.
  CONTINUE.
ENDIF.`;
    const issues = runProgram(abap);
    
    const continueIssues = issues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(1);
  });

  it("should handle nested loops correctly", () => {
    const abap = `LOOP AT outer_items INTO outer_item.
  DO 5 TIMES.
    CONTINUE.
  ENDDO.
  CONTINUE.
ENDLOOP.`;
    const issues = runProgram(abap);
    
    const continueIssues = issues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(0);
  });

  it("should report error for CONTINUE after nested loop ends", () => {
    const abap = `LOOP AT outer_items INTO outer_item.
  DO 5 TIMES.
    WRITE 'test'.
  ENDDO.
ENDLOOP.
CONTINUE.`;
    const issues = runProgram(abap);
    
    const continueIssues = issues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(1);
  });

  it("should not report error for CONTINUE inside mixed nested structures", () => {
    const abap = `LOOP AT items INTO item.
  IF item-type = 'A'.
    CASE item-status.
      WHEN 'NEW'.
        CONTINUE.
      WHEN OTHERS.
        WRITE 'other'.
    ENDCASE.
  ENDIF.
ENDLOOP.`;
    const issues = runProgram(abap);
    
    const continueIssues = issues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(0);
  });
});