import {CallTransactionAuthorityCheck} from "../../src/rules/call_transaction_authority_check";
import {testRule} from "./_utils";
import {Config, Issue, MemoryFile, Registry, Version} from "../../src";
import {expect} from "chai";

const tests = [
  {abap: "CALL TRANSACTION 'ZFOO' WITH AUTHORITY-CHECK.", cnt: 0},
  {abap: "CALL TRANSACTION 'ZFOO' WITHOUT AUTHORITY-CHECK.", cnt: 1},
  {abap: "CALL TRANSACTION 'ZFOO' AND SKIP FIRST SCREEN.", cnt: 1},
];

testRule(tests, CallTransactionAuthorityCheck);


async function findIssues(abap: string, version?: Version): Promise<readonly Issue[]> {
  const config = Config.getDefault(version);
  const reg = new Registry(config).addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new CallTransactionAuthorityCheck();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: call transaction with-authority check, version dependent", () => {
  it("No auth check, below v740sp02: ignore", async () => {
    const issues = await findIssues("CALL TRANSACTION 'ZFOO' AND SKIP FIRST SCREEN.", Version.v702);
    expect(issues.length).to.equal(0);
  });

  it("No auth check, v740sp02 : issue", async () => {
    const issues = await findIssues("CALL TRANSACTION 'ZFOO' AND SKIP FIRST SCREEN.", Version.v740sp02);
    expect(issues.length).to.equal(1);
  });

  it("Auth check, v740sp02 : no issue", async () => {
    const issues = await findIssues("CALL TRANSACTION 'ZFOO' WITH AUTHORITY-CHECK.", Version.v740sp02);
    expect(issues.length).to.equal(0);
  });

  it("No Auth check, Cloud : no issue, CALL TRANSACTION not possible", async () => {
    const issues = await findIssues("CALL TRANSACTION 'ZFOO' WITH AUTHORITY-CHECK.", Version.Cloud);
    expect(issues.length).to.equal(0);
  });

});