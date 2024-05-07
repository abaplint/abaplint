import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {AlignPseudoComments} from "../../src/rules";
import {Issue} from "../../src/issue";
// import {testRuleFixSingle} from "./_utils";

/*
function testFix(input: string, expected: string, noIssuesAfter = true) {
  testRuleFixSingle(input, expected, new AlignPseudoComments(), undefined, undefined, noIssuesAfter);
}
*/

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new AlignPseudoComments();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe.only("Rule: align_pseudo_comments", () => {

  it("parser error, no issues expected", async () => {
    const issues = await findIssues("hello world.");
    expect(issues.length).to.equal(0);
  });

  it("ok1", async () => {
    const issues = await findIssues(`WRITE 'sdf'.                                                "#EC sdf`);
    expect(issues.length).to.equal(0);
  });

  it("ok2", async () => {
    const issues = await findIssues(`WRITE 'sdf'.                                                "#EC sdfaaa`);
    expect(issues.length).to.equal(0);
  });

  it.only("ok3", async () => {
    const issues = await findIssues(`WRITE 'sdf'.                                    "#EC sdfsdfsdfsdfsdfsdf`);
    expect(issues.length).to.equal(0);
  });

  it("err1", async () => {
    const issues = await findIssues(`WRITE 'sdf'. "#EC sdf`);
    expect(issues.length).to.equal(1);
  });

  it("err2", async () => {
    const issues = await findIssues(`WRITE 'sdf'.            "#EC sdf`);
    expect(issues.length).to.equal(1);
  });

  it("ok, long", async () => {
    const issues = await findIssues(`WRITE 'ssdfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffdf'. "#EC sdf`);
    expect(issues.length).to.equal(0);
  });

});
