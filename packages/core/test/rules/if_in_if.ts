import {IfInIf} from "../../src/rules";
import {testRule, testRuleFixCount} from "./_utils";

function testFix(input: string, expected: string) {
  testRuleFixCount(input, expected, new IfInIf());
}

const tests = [
  {abap: `parser error`, cnt: 0},
  {abap: `IF foo = bar.
          ENDIF.`, cnt: 0},
  {abap: `IF foo = bar.
          ELSE.
          ENDIF.`, cnt: 0},
  {abap: `CHECK foo = bar.`, cnt: 0},
  {abap: `IF foo = bar.
            IF moo = boo.
            ENDIF.
          ENDIF.`, cnt: 1},
  {abap: `IF foo = bar.
            WRITE bar.
            IF moo = boo.
            ENDIF.
          ENDIF.`, cnt: 0},
  {abap: `IF foo = bar.
            IF moo = boo.
            ENDIF.
            WRITE bar.
          ENDIF.`, cnt: 0},
  {abap: `IF foo = bar.
          ELSE.
            IF moo = boo.
            ENDIF.
          ENDIF.`, cnt: 1},
  {abap: `IF foo = bar.
          ELSE.
            IF moo = boo.
            ELSE.
            ENDIF.
          ENDIF.`, cnt: 1},
  {abap: `IF foo = bar.
          ELSEIF moo = loo.
            IF moo = boo.
            ENDIF.
          ENDIF.`, cnt: 0},
  {abap: `IF foo = bar.
          ELSEIF moo = boo.
          ENDIF.`, cnt: 0},
];

testRule(tests, IfInIf);

describe("Rule: if in f", () => {

  it("test fix", async () => {
    const abap = `
IF 1 = 2.
ELSE.
IF 3 = 4.
ENDIF.
ENDIF.`;
    const expected = `
IF 1 = 2.
ELSEIF 3 = 4.
ENDIF.
`;
    testFix(abap, expected);
  });

});