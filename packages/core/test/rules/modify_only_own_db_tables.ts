import {expect} from "chai";
import {Issue, MemoryFile, Registry} from "../../src";
import {ModifyOnlyOwnDBTables, ModifyOnlyOwnDBTablesConf} from "../../src/rules";
import {testRule} from "./_utils";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap));
  await reg.parseAsync();
  const rule = new ModifyOnlyOwnDBTables();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: mix modify_only_own_db_tabes", () => {
  it("call transaction", async () => {
    const abap = "CALL TRANSACTION 'ZFOO' WITH AUTHORITY-CHECK.";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("parser error", async () => {
    const abap = "sdfds";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("delete own, ok", async () => {
    const abap = "DELETE FROM zbar WHERE moo = @bar.";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("delete own, err", async () => {
    const abap = `
FORM sdffsd.
  DATA bar TYPE i.
  DELETE FROM bar WHERE moo = @bar.
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("modify screen", async () => {
    const abap = "MODIFY SCREEN FROM line.";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("insert dynamic", async () => {
    const abap = "INSERT (lv_tab) FROM @lv_data.";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("modify internal, ok", async () => {
    const abap = `
FORM foo.
  DATA foo TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  DATA row LIKE LINE OF foo.
  MODIFY foo FROM row.
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });
});

const dontReportDynamic = new ModifyOnlyOwnDBTablesConf();
dontReportDynamic.reportDynamic = false;

const tests2 = [
  {abap: `FORM foo.
  DATA bar TYPE i.
  DELETE FROM bar WHERE moo = @bar.
ENDFORM.`, cnt: 1},
  {abap: "INSERT (lv_tab) FROM @lv_data.", cnt: 0},
];

testRule(tests2, ModifyOnlyOwnDBTables, dontReportDynamic);