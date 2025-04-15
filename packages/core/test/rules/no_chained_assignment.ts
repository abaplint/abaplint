import {NoChainedAssignment} from "../../src/rules";
import {testRule, testRuleFixSingle} from "./_utils";

function testFix(input: string, expected: string, noIssuesAfter = true) {
  testRuleFixSingle(input, expected, new NoChainedAssignment(), undefined, undefined, noIssuesAfter);
}

const tests = [
  {abap: `parser error`, cnt: 0},
  {abap: `var1 = var2 = var3.`, cnt: 1},
  {abap: `var2 = var3.
var1 = var3.`, cnt: 0},
];

testRule(tests, NoChainedAssignment);

describe("Rule: no_chained_assignment", () => {

  it("quick fix 1", async () => {
    const abap = `
var1 = var2 = var3.`;
    const expected = `
var2 = var3.
var1 = var2.`;
    testFix(abap, expected, false);
  });

});
