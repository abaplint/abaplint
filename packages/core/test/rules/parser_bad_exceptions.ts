import {Config} from "../../src/config";
import {Version} from "../../src/version";
import {Issue} from "../../src/issue";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {ParserBadExceptions} from "../../src/rules";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const config = Config.getDefault(Version.v702);
  const reg = new Registry(config).addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new ParserBadExceptions();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: parser_bad_exceptions", () => {

  it("no issues", async () => {
    const issues = await findIssues("pasrser error.");
    expect(issues.length).to.equal(0);
  });

  it("issue", async () => {
    const issues = await findIssues(`
CALL FUNCTION 'BDC_OPEN_GROUP'
    EXPORTING
      client              = sy-mandt
      group               = binam
      user                = usnam
      keep                = xkeep
      holddate            = start
    EXCEPTIONS
      client_invalid
      destination_invalid
      group_invalid
      group_is_locked
      holddate_invalid
      internal_error
      queue_error
      running
      system_lock_error
      user_invalid.`);
    expect(issues.length).to.equal(1);
  });

});