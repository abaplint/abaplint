import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {Issue} from "../../src/issue";
import {CheckSyntax, CheckSyntaxConf} from "../../src/rules";
import {Severity} from "../../src";

// the actual syntax logic is tested in "\packages\core\test\abap\syntax\syntax.ts"

async function findIssues(abap: string, config?: CheckSyntaxConf, filename?: string): Promise<readonly Issue[]> {
  if (!filename) {
    filename = "cl_foobar.clas.abap";
  }
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new CheckSyntax();
  if (config) {
    rule.setConfig(config);
  }
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: check_syntax", () => {

  it("error, default severity is error", async () => {
    const abap = `
CLASS cl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS cl_foobar IMPLEMENTATION.
  METHOD bar.
    WRITE foo.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("error, change severity to information", async () => {
    const abap = `
CLASS cl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS cl_foobar IMPLEMENTATION.
  METHOD bar.
    WRITE foo.
  ENDMETHOD.
ENDCLASS.`;
    const conf = new CheckSyntaxConf();
    conf.severity = Severity.Info;
    const issues = await findIssues(abap, conf);
    expect(issues.length).to.equal(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Info);
  });

});