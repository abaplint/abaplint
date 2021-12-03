import {SpaceBeforeColon} from "../../src/rules/space_before_colon";
import {testRule, testRuleFixSingle} from "./_utils";

const tests = [
  {abap: "WRITE : 'foo'.", cnt: 1},
  {abap: "WRITE: 'foo'.", cnt: 0},
  {abap: ":WRITE 'foo'.", cnt: 0},
];

testRule(tests, SpaceBeforeColon);

function testFix(input: string, expected: string) {
  testRuleFixSingle(input, expected, new SpaceBeforeColon());
}

describe("Rule: space_before_colon", () => {
  it("quick fix 1", async () => {
    const abap = "WRITE : 'foo'.";
    const expected = "WRITE: 'foo'.";
    testFix(abap, expected);
  });
});