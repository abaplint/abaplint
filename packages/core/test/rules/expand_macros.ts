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


describe.skip("Rule: expand_macros, quick fixes", () => {

  it("quick fix 1", async () => {
    const abap = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
    WRITE 2.
    DATA foo TYPE c.
  ENDMETHOD.
ENDCLASS.`;
    const expected = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
    DATA foo TYPE c.
    WRITE 2.
` + "    " + `
  ENDMETHOD.
ENDCLASS.`;
    testFix(abap, expected);
  });

});