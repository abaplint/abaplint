import {UnnecessaryChaining} from "../../src/rules";
import {testRule, testRuleFixSingle} from "./_utils";

const tests = [
  {abap: `parser error`, cnt: 0},
  {abap: `WRITE: bar.`, cnt: 1},
  {abap: `WRITE bar.`, cnt: 0},
  {abap: `WRITE: bar, moo.`, cnt: 0},
];

testRule(tests, UnnecessaryChaining);

function testFix(input: string, expected: string) {
  testRuleFixSingle(input, expected, new UnnecessaryChaining());
}

describe("Rule: unnecessary_chaining", () => {
  it("quick fix 1", async () => {
    const abap = "WRITE: 'foo'.";
    const expected = "WRITE 'foo'.";
    testFix(abap, expected);
  });
});