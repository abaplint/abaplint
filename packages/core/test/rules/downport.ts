import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {Downport} from "../../src/rules";
import {Config} from "../../src/config";
import {testRuleFixSingle} from "./_utils";
import {IConfiguration} from "../../src/_config";
import {Version} from "../../src/version";
import {Issue} from "../../src/issue";

function buildConfig(): IConfiguration {
  const conf = Config.getDefault().get();
  conf.syntax.version = Version.v702;
  const conf702 = new Config(JSON.stringify(conf));
  return conf702;
}

function testFix(input: string, expected: string) {
  testRuleFixSingle(input, expected, new Downport(), buildConfig());
}

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry(buildConfig()).addFile(new MemoryFile("zdownport.prog.abap", abap));
  await reg.parseAsync();
  const rule = new Downport();
  return rule.initialize(reg).run(reg.getObjects()[0]);
}

describe("Rule: downport, basics", () => {

  it("parser error", async () => {
    const issues = await findIssues("parser error");
    expect(issues.length).to.equal(0);
  });

  it("all okay, pass along", async () => {
    const issues = await findIssues("WRITE bar.");
    expect(issues.length).to.equal(0);
  });

});

describe("Rule: NEW", () => {

  it("Use CREATE OBJECT instead of NEW", async () => {
    const issues = await findIssues("foo = NEW #( ).");
    expect(issues.length).to.equal(1);
  });

  it("quick fix, Use CREATE OBJECT instead of NEW", async () => {
    testFix("foo = NEW #( ).", "CREATE OBJECT foo.");
  });

  it("test position of quick fix is second line", async () => {
    testFix("DATA foo TYPE i.\nfoo = NEW #( ).", "DATA foo TYPE i.\nCREATE OBJECT foo.");
  });

  it("quick fix, with TYPE", async () => {
    testFix("foo = NEW zcl_bar( ).", "CREATE OBJECT foo TYPE zcl_bar.");
  });

  it("with a parameter", async () => {
    testFix("foo = NEW #( foo = bar ).", "CREATE OBJECT foo EXPORTING foo = bar.");
  });

});

describe("Rule: inline DATA", () => {

  it.skip("Inline DATA definition", async () => {
    const issues = await findIssues("DATA(foo) = 2.");
    expect(issues.length).to.equal(1);
  });

});
