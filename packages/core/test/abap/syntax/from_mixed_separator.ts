import {expect} from "chai";
import {runProgram} from "./syntax";

const program = (body: string): string => `
REPORT zfrom_mixed.
DATA i TYPE i.
DATA c TYPE c LENGTH 1.
DATA s TYPE string.
START-OF-SELECTION.
${body}`;

const issuesOf = (body: string) => runProgram(program(body)).map(i => i.getMessage());

describe("syntax.ts, sep of from_mixed( )", () => {

  const valid = [
    "s = from_mixed( val = s ).",
    "s = from_mixed( val = s sep = '_' ).",
    "s = from_mixed( val = s sep = `_` ).",
    "s = from_mixed( val = s sep = |_| ).",
    "s = from_mixed( val = s sep = c ).",
    "s = from_mixed( val = s sep = s ).",
    "s = from_mixed( val = s sep = c && c ).",
    "s = from_mixed( val = s sep = c case = 'X' min = i ).",
  ];
  for (const statement of valid) {
    it("ok, " + statement, () => {
      expect(issuesOf(statement)).to.deep.equal([]);
    });
  }

  const numeric = [
    "s = from_mixed( val = s sep = 1 ).",
    "s = from_mixed( val = s sep = i ).",
  ];
  for (const statement of numeric) {
    it("error, " + statement, () => {
      expect(issuesOf(statement)).to.deep.equal(["Method parameter type not compatible, SEP"]);
    });
  }

  it("error, parentheses", () => {
    expect(issuesOf("s = from_mixed( val = s sep = ( c ) )."))
      .to.deep.equal([`Parentheses not allowed in parameter "sep" of built-in function "from_mixed"`]);
  });

});
