import {ElseAfterAllReturns} from "../../src/rules";
import {testRule, testRuleFixSingle} from "./_utils";

const tests = [
  // should not flag
  {abap: `parser error`, cnt: 0},
  {abap: `IF foo = bar.
  ENDIF.`, cnt: 0},
  {abap: `IF foo = bar.
  ELSE.
  ENDIF.`, cnt: 0},
  {abap: `IF foo = bar.
  WRITE 'hello'.
ELSE.
  WRITE 'world'.
ENDIF.`, cnt: 0},
  // only one branch exits, ELSE must stay
  {abap: `IF foo = bar.
  RETURN.
ELSEIF foo = baz.
  WRITE 'x'.
ELSE.
  WRITE 'y'.
ENDIF.`, cnt: 0},
  // all branches exit — should flag
  {abap: `IF foo = bar.
  RETURN.
ELSE.
  WRITE 'world'.
ENDIF.`, cnt: 1},
  {abap: `IF foo = bar.
  EXIT.
ELSE.
  WRITE 'world'.
ENDIF.`, cnt: 1},
  {abap: `IF foo = bar.
  CONTINUE.
ELSE.
  WRITE 'world'.
ENDIF.`, cnt: 1},
  // all ELSEIF branches also exit
  {abap: `IF foo = bar.
  RETURN.
ELSEIF foo = baz.
  RETURN.
ELSE.
  WRITE 'y'.
ENDIF.`, cnt: 1},
  // RAISE non-resumable
  {abap: `IF foo = bar.
  RAISE EXCEPTION TYPE cx_error.
ELSE.
  WRITE 'world'.
ENDIF.`, cnt: 1},
  // RAISE RESUMABLE — must NOT flag
  {abap: `IF foo = bar.
  RAISE RESUMABLE EXCEPTION TYPE cx_error.
ELSE.
  WRITE 'world'.
ENDIF.`, cnt: 0},
  // LEAVE PROGRAM — exits
  {abap: `IF foo = bar.
  LEAVE PROGRAM.
ELSE.
  WRITE 'world'.
ENDIF.`, cnt: 1},
  // LEAVE TO LIST-PROCESSING — does not exit method
  {abap: `IF foo = bar.
  LEAVE TO LIST-PROCESSING.
ELSE.
  WRITE 'world'.
ENDIF.`, cnt: 0},
  // empty ELSE body — still redundant
  {abap: `IF foo = bar.
  RETURN.
ELSE.
ENDIF.`, cnt: 1},
  // last statement of branch must be the exit — other statements before are fine
  {abap: `IF foo = bar.
  WRITE 'x'.
  RETURN.
ELSE.
  WRITE 'world'.
ENDIF.`, cnt: 1},
  // last statement is not an exit
  {abap: `IF foo = bar.
  RETURN.
  WRITE 'x'.
ELSE.
  WRITE 'world'.
ENDIF.`, cnt: 0},
];

testRule(tests, ElseAfterAllReturns);

describe("Rule: else_after_all_returns - quickfix", () => {

  it("removes ELSE and ENDIF for simple IF/RETURN/ELSE", () => {
    const input =
`IF foo = bar.
  RETURN.
ELSE.
  WRITE 'world'.
ENDIF.`;
    const expected =
`IF foo = bar.
  RETURN.
ENDIF.
  WRITE 'world'.
`;
    testRuleFixSingle(input, expected, new ElseAfterAllReturns());
  });

  it("removes ELSE and ENDIF preserving ELSEIF chain", () => {
    const input =
`IF foo = bar.
  RETURN.
ELSEIF foo = baz.
  RETURN.
ELSE.
  WRITE 'y'.
ENDIF.`;
    const expected =
`IF foo = bar.
  RETURN.
ELSEIF foo = baz.
  RETURN.
ENDIF.
  WRITE 'y'.
`;
    testRuleFixSingle(input, expected, new ElseAfterAllReturns());
  });

});
