import {expect} from "chai";
import {runProgram} from "./syntax";

describe("syntax.ts, COMPUTE is checked as the assignment it stands for", () => {
  const program = (statement: string): string => `
DATA r TYPE i.
DATA i TYPE i.
DATA s TYPE string.
DATA c5 TYPE c LENGTH 5.
DATA u TYPE utclong.
CONSTANTS co TYPE i VALUE 1.
${statement}`;

  const messages = (statement: string): string[] => {
    return runProgram(program(statement)).map(i => i.getMessage());
  };

  for (const statement of ["COMPUTE r = zzz + 1.", "COMPUTE zzz = i + 1.", "COMPUTE r = u + 1.",
    "COMPUTE s = c5(0).", "COMPUTE co = i.", "COMPUTE EXACT r = zzz."]) {
    it("error, " + statement, () => {
      const plain = statement.replace(/^COMPUTE (EXACT )?/, "");
      const expected = messages(plain);
      expect(expected.length).to.equal(1, "plain assignment " + plain);
      expect(messages(statement)).to.deep.equal(expected);
    });
  }

  for (const statement of ["COMPUTE r = i + 1.", "COMPUTE EXACT r = i.", "COMPUTE s = c5.",
    "COMPUTE r = strlen( s ) * 2.", "COMPUTE s = |{ i }|."]) {
    it("ok, " + statement, () => {
      expect(messages(statement)).to.deep.equal([]);
    });
  }
});
