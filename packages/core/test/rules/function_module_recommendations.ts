import {expect} from "chai";
import {Config, Issue, MemoryFile, Registry, Version} from "../../src";
import {FunctionModuleRecommendations} from "../../src/rules/function_module_recommendations";
import {testRule} from "./_utils";


const tests = [
  {abap: "CALL FUNCTION 'REUSE_ALV_GRID_DISPLAY'.", cnt: 1},
  {abap: "DATA fm_name TYPE string. fm_name = 'REUSE_ALV_GRID_DISPLAY'. CALL FUNCTION fm_name.", cnt: 0},
  {abap: "DATA round TYPE string. fm_name = 'FOO_BAR'. CALL FUNCTION round.", cnt: 0},
  {abap: "CALL FUNCTION 'FOO_BAR'.", cnt: 0},
];

testRule(tests, FunctionModuleRecommendations);

async function findIssues(abap: string, version?: Version): Promise<readonly Issue[]> {
  const config = Config.getDefault(version);
  const reg = new Registry(config).addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new FunctionModuleRecommendations();
  const ruleConf = rule.getConfig();
  ruleConf.recommendations = [{name: "CALCULATE_HASH_FOR_RAW", replace: "use CL_ABAP_HMAC", from: Version.v750}];
  rule.setConfig(ruleConf);
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: Function Module Recommedations, Versions", () => {
  it("no issues", async () => {
    const issues = await findIssues("DATA(foo) = 2.");
    expect(issues.length).to.equal(0);
  });

  it("Version below from", async () => {
    const issues = await findIssues("CALL FUNCTION 'CALCULATE_HASH_FOR_RAW'.", Version.v702);
    expect(issues.length).to.equal(0);
  });

  it("Version larger-equals from", async () => {
    const issues = await findIssues("CALL FUNCTION 'CALCULATE_HASH_FOR_RAW'.", Version.v750);
    expect(issues.length).to.equal(1);
  });
});