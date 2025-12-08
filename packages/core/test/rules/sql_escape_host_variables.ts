import {expect} from "chai";
import {Config, Issue, MemoryFile, Registry, Version} from "../../src";
import {SQLEscapeHostVariables} from "../../src/rules";
import {testRule, testRuleFixSingle} from "./_utils";

function testFix(input: string, expected: string, noIssuesAfter = true) {
  testRuleFixSingle(input, expected, new SQLEscapeHostVariables(), undefined, undefined, noIssuesAfter);
}

async function findIssues(abap: string, version?: Version): Promise<readonly Issue[]> {
  const config = Config.getDefault(version);
  const reg = new Registry(config).addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new SQLEscapeHostVariables();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},
  {abap: "SELECT SINGLE bname FROM usr02 INTO lv_bname.", cnt: 1},
  {abap: "SELECT SINGLE bname FROM usr02 INTO @lv_bname.", cnt: 0},
  {abap: "SELECT SINGLE foo bar INTO (@<ls_data>-foo, @<ls_data>-bar) FROM zfoo.", cnt: 0},
  {abap: "SELECT * FROM usr02 INTO TABLE lt_data.", cnt: 1},
  {abap: "SELECT * FROM usr02 INTO TABLE @lt_data.", cnt: 0},
  {abap: "SELECT SINGLE foo bar INTO (<ls_data>-foo, <ls_data>-bar) FROM zfoo.", cnt: 1},
  {abap: "SELECT * FROM usr02 APPENDING CORRESPONDING FIELDS OF TABLE @lt_data.", cnt: 0},
  {abap: "SELECT * FROM usr02 APPENDING TABLE @lt_data.", cnt: 0},
  {abap: "SELECT SINGLE bname FROM usr02 INTO (@lv_bname).", cnt: 0},
  {abap: "SELECT COUNT(*) FROM usr01 WHERE bname = @iv_user_name.", cnt: 0},
  {abap: "UPDATE zabaplint_pack SET json = iv_json WHERE devclass = iv_devclass.", cnt: 1},
  {abap: "DELETE FROM zabaplint_pack WHERE devclass = iv_devclass.", cnt: 1},
  {abap: "UPDATE zabaplint_pack SET json = 'A' WHERE devclass = 2.", cnt: 0},
  {abap: "DELETE FROM zabaplint_pack WHERE devclass = 2.", cnt: 0},
  {abap: "INSERT dbtab FROM TABLE lt_insert.", cnt: 1},
  {abap: "UPDATE zsdfds SET aendt = sy-datum aenuhr = sy-uzeit WHERE wsss = is_message-sdf AND bar = is_message-sdfsd.", cnt: 1},
  {abap: "SELECT cimstp segtyp INTO (ls_idocsyn-segtyp, ls_idocsyn-parseg) FROM cimsyn WHERE cimtyp = bar ORDER BY nr DESCENDING. ENDSELECT.", cnt: 2},
  {abap: "MODIFY SCREEN FROM line.", cnt: 0},
  {abap: "SELECT COUNT(*) FROM e070 WHERE trkorr = iv_transport AND trstatus = 'R'.", cnt: 1},
  {abap: "DELETE (iv_name) FROM TABLE <lg_del>.", cnt: 1},
  {abap: "DELETE (iv_name) FROM TABLE @<lg_del>.", cnt: 0},
  {abap: "modify et_table from ls_row.", cnt: 0},
  {abap: `DELETE FROM kernel_locks WHERE table_name = ls_lock-table_name AND lock_key = ls_lock-lock_key.`, cnt: 1},
];

testRule(tests, SQLEscapeHostVariables);

describe("Rule: sql_escape_host_variables", () => {

  it("quick fix 1", async () => {
    const abap = `SELECT SINGLE bname FROM usr02 INTO lv_bname.`;
    const expected = `SELECT SINGLE bname FROM usr02 INTO @lv_bname.`;
    testFix(abap, expected);
  });

  it("Open ABAP", async () => {
    const abap = `DELETE FROM kernel_locks WHERE table_name = ls_lock-table_name AND lock_key = ls_lock-lock_key.`;
    const issues = await findIssues(abap, Version.OpenABAP);
    expect(issues.length).to.equal(1);
  });

});