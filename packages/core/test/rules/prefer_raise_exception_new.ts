import {PreferRaiseExceptionNew} from "../../src/rules";
import {Config} from "../../src/config";
import {Version} from "../../src/version";
import {Issue} from "../../src/issue";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {expect} from "chai";

async function findIssues(abap: string, version?: Version): Promise<readonly Issue[]> {
  const config = Config.getDefault(version);
  const reg = new Registry(config).addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new PreferRaiseExceptionNew();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: prefer RAISE EXCEPTION NEW to RAISE EXCEPTION TYPE", () => {
  it("no issues", async () => {
    const issues1 = await findIssues(`RAISE EXCEPTION TYPE cx_generation_error
    EXPORTING
      previous = exception.`, Version.v702);
    expect(issues1.length).to.equal(0);

    const issues2 = await findIssues(`RAISE EXCEPTION TYPE cx_generation_error
    EXPORTING
      previous = exception.`, Version.v751);
    expect(issues2.length).to.equal(0);

    const issues3 = await findIssues("RAISE EXCEPTION NEW cx_generation_error( previous = exception ).");
    expect(issues3.length).to.equal(0);

    const issues4 = await findIssues("parser error");
    expect(issues4.length).to.equal(0);

    const issues5 = await findIssues("CREATE OBJECT foobar.");
    expect(issues5.length).to.equal(0);
  });

  it("with MESSAGE", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE cx_blah MESSAGE e003.");
    expect(issues.length).to.equal(0);
  });

  it("issue", async () => {
    const issues1 = await findIssues(`RAISE EXCEPTION TYPE cx_generation_error
    EXPORTING
      previous = exception.`);
    expect(issues1.length).to.equal(1);

    const issues2 = await findIssues(`RAISE EXCEPTION TYPE cx_generation_error
    EXPORTING
      previous = exception.`, Version.v752);
    expect(issues2.length).to.equal(1);
  });
});
