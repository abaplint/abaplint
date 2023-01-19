import {ExpandMacros} from "../../src/rules";
import {testRule, testRuleFixSingle} from "./_utils";

function testFix(input: string, expected: string, noIssuesAfter = true) {
  testRuleFixSingle(input, expected, new ExpandMacros(), undefined, undefined, noIssuesAfter);
}

const tests = [
  {
    abap: `parser error`,
    cnt: 0,
  },
  {
    abap: `WRITE 'hello'.`,
    cnt: 0,
  },
  {
    abap: `DEFINE _hello.
    WRITE 'hello'.
  end-of-definition.
  _hello.`,
    cnt: 1,
  },
  {
    abap: `DEFINE _hello.
    WRITE 'hello'.
  end-of-definition.`,
    cnt: 0,
  },
];

testRule(tests, ExpandMacros);


describe("Rule: expand_macros, quick fixes", () => {

  it("quick fix 1", async () => {
    const abap = `DEFINE _hello.
  WRITE 'hello'.
end-of-definition.
_hello.`;
    const expected = `DEFINE _hello.
  WRITE 'hello'.
end-of-definition.
WRITE 'hello' .`;
    testFix(abap, expected);
  });

  it("quick fix, something after", async () => {
    const abap = `DEFINE _hello.
  WRITE 'hello'.
end-of-definition.
_hello.
DATA foo.`;
    const expected = `DEFINE _hello.
  WRITE 'hello'.
end-of-definition.
WRITE 'hello' .
DATA foo.`;
    testFix(abap, expected);
  });

  it("multi line", async () => {
    const abap = `DEFINE _hello.
  WRITE 'hello'.
  WRITE 'world'.
end-of-definition.
_hello.`;
    const expected = `DEFINE _hello.
  WRITE 'hello'.
  WRITE 'world'.
end-of-definition.
WRITE 'hello' .
WRITE 'world' .`;
    testFix(abap, expected);
  });

});