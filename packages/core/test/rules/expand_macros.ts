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
WRITE 'hello'.`;
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
WRITE 'hello'.
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
WRITE 'hello'.
WRITE 'world'.`;
    testFix(abap, expected);
  });

  it("BIT-AND", async () => {
    const abap = `DATA x1 TYPE x LENGTH 1.
DATA x2 TYPE x LENGTH 1.
DEFINE _bit.
  x1 = x1 BIT-AND x2.
end-of-definition.
_bit.`;
    const expected = `DATA x1 TYPE x LENGTH 1.
DATA x2 TYPE x LENGTH 1.
DEFINE _bit.
  x1 = x1 BIT-AND x2.
end-of-definition.
x1 = x1 BIT-AND x2.`;
    testFix(abap, expected);
  });

  it("chained macro call, first step", async () => {
    const abap = `DEFINE _write.
  WRITE &1.
end-of-definition.
_write: 'hello', 'world'.`;
    const expected = `DEFINE _write.
  WRITE &1.
end-of-definition.
WRITE 'hello'.
_write: 'world'.`;
    testFix(abap, expected, false);
  });

  it("chained macro call, second step", async () => {
    const abap = `DEFINE _write.
  WRITE &1.
end-of-definition.
WRITE 'hello'.
_write: 'world'.`;
    const expected = `DEFINE _write.
  WRITE &1.
end-of-definition.
WRITE 'hello'.
WRITE 'world'.
`;
    testFix(abap, expected, false);
  });

  it("nested, two parameters", async () => {
    const abap = `DEFINE _moo.
  DATA &1 TYPE i.
END-OF-DEFINITION.
DEFINE _hello.
  WRITE &1.
  _moo &2.
END-OF-DEFINITION.
_hello 'hello' sdf.`;
    const expected = `DEFINE _moo.
  DATA &1 TYPE i.
END-OF-DEFINITION.
DEFINE _hello.
  WRITE &1.
  _moo &2.
END-OF-DEFINITION.
WRITE 'hello'.
DATA sdf TYPE i.`;
    testFix(abap, expected, false);
  });

});