import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";

describe("Continue syntax check", () => {
  it("should report error for CONTINUE outside loop", async () => {
    const abap = "CONTINUE.";
    const reg = new Registry().addFile(new MemoryFile("test.prog.abap", abap));
    await reg.parseAsync();
    const issues = reg.findIssues();
    
    const syntaxIssues = issues.filter(i => i.getKey() === "check_syntax");
    expect(syntaxIssues).to.have.lengthOf(1);
    expect(syntaxIssues[0].getMessage()).to.include("CONTINUE is not allowed outside of loops");
  });

  it("should not report error for CONTINUE inside loop", async () => {
    const abap = `LOOP AT items INTO item.
  CONTINUE.
ENDLOOP.`;
    const reg = new Registry().addFile(new MemoryFile("test.prog.abap", abap));
    await reg.parseAsync();
    const issues = reg.findIssues();
    
    const syntaxIssues = issues.filter(i => i.getKey() === "check_syntax");
    const continueIssues = syntaxIssues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(0);
  });

  it("should not report error for CONTINUE inside DO loop", async () => {
    const abap = `DO 10 TIMES.
  CONTINUE.
ENDDO.`;
    const reg = new Registry().addFile(new MemoryFile("test.prog.abap", abap));
    await reg.parseAsync();
    const issues = reg.findIssues();
    
    const syntaxIssues = issues.filter(i => i.getKey() === "check_syntax");
    const continueIssues = syntaxIssues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(0);
  });

  it("should report error for CONTINUE in CASE outside loop", async () => {
    const abap = `CASE abap_true.
  WHEN 'X'.
    CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
  WHEN OTHERS.
    CONTINUE.
ENDCASE.`;
    const reg = new Registry().addFile(new MemoryFile("test.prog.abap", abap));
    await reg.parseAsync();
    const issues = reg.findIssues();
    
    const syntaxIssues = issues.filter(i => i.getKey() === "check_syntax");
    const continueIssues = syntaxIssues.filter(i => i.getMessage().includes("CONTINUE"));
    expect(continueIssues).to.have.lengthOf(1);
  });
});