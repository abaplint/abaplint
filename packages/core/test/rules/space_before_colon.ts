import {SpaceBeforeColon} from "../../src/rules/space_before_colon";
import {testRule, testRuleFixSingle} from "./_utils";

const tests = [
  {abap: "WRITE : 'foo'.", cnt: 1},
  {abap: "WRITE: 'foo'.", cnt: 0},
  {abap: ":WRITE 'foo'.", cnt: 0},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.
    CLASS-METHODS get_dummy FOR TABLE FUNCTION /test/abc.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get_dummy BY DATABASE FUNCTION FOR HDB LANGUAGE SQLSCRIPT OPTIONS READ-ONLY.
    RETURN
      SELECT dummy FROM sys.dummy WHERE dummy = :var;
  ENDMETHOD.
ENDCLASS.`, cnt: 0},
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