import {expect} from "chai";
import {runProgram} from "./syntax";

const program = (body: string): string => `
REPORT zcompare.
DATA c TYPE c LENGTH 30.
DATA s TYPE string.
DATA n TYPE n LENGTH 4.
DATA d TYPE d.
DATA t TYPE t.
DATA x TYPE x LENGTH 4.
DATA xs TYPE xstring.
DATA i TYPE i.
DATA i8 TYPE int8.
DATA p TYPE p LENGTH 8 DECIMALS 2.
DATA f TYPE f.
DATA d34 TYPE decfloat34.
DATA u TYPE utclong.
DATA u2 TYPE utclong.
START-OF-SELECTION.
${body}`;

const issuesOf = (body: string) => runProgram(program(body)).map(i => i.getMessage());

describe("syntax.ts, comparison of types without a comparison type", () => {
  const message = "Incompatible types for comparison";

  const errors = ["d = t", "t < d", "d EQ t", "d BETWEEN t AND d", "d NOT BETWEEN d AND t", "u = i", "u = i8",
    "u = n", "u = x", "u = xs", "u = d", "u = t", "u = p", "u = f", "u = d34", "u = 1", "i = u",
    "u BETWEEN i AND i", "u BETWEEN u2 AND i"];
  for (const condition of errors) {
    it("error, " + condition, () => {
      expect(issuesOf(`IF ${condition}.\nENDIF.`)).to.deep.equal([message]);
    });
  }

  const ok = ["u = u2", "u = c", "u = s", "s = u", "u = 'x'", "u = `x`", "u BETWEEN c AND u2", "d = d", "t = c",
    "d = c", "t = n", "i = d", "d CO '0123456789'", "u IS INITIAL"];
  for (const condition of ok) {
    it("ok, " + condition, () => {
      expect(issuesOf(`IF ${condition}.\nENDIF.`)).to.deep.equal([]);
    });
  }

  const caseErrors: [string, string][] = [["d", "t"], ["t", "c OR d"], ["u", "i"], ["i", "u"]];
  for (const [operand, value] of caseErrors) {
    it(`error, CASE ${operand}, WHEN ${value}`, () => {
      expect(issuesOf(`CASE ${operand}.\n  WHEN ${value}.\nENDCASE.`)).to.deep.equal([message]);
    });
  }

  // an arithmetic expression after CASE is calculated on its own
  const caseOk: [string, string][] = [["u", "c OR u2 OR 'x'"], ["d", "c"], ["i + 1", "d OR t OR c"], ["i + 1", "u"]];
  for (const [operand, value] of caseOk) {
    it(`ok, CASE ${operand}, WHEN ${value}`, () => {
      expect(issuesOf(`CASE ${operand}.\n  WHEN ${value}.\nENDCASE.`)).to.deep.equal([]);
    });
  }

  it("the operand of the innermost CASE counts", () => {
    expect(issuesOf(`CASE d.
  WHEN d.
    CASE t.
      WHEN t.
    ENDCASE.
  WHEN t.
ENDCASE.`)).to.deep.equal([message]);
  });
});

describe("syntax.ts, calculations compared with non-numeric operands", () => {
  const message = "cannot be compared with non-numeric operand";

  const arithmetic = ["ipow( base = i exp = 2 )", "nmax( val1 = i val2 = 1 )", "nmin( val1 = i val2 = 1 )",
    "round( val = f dec = 1 )", "abs( i + 1 )", "abs( - i )", "sign( i + 1 )", "ceil( f + 1 )", "floor( abs( f ) )",
    "trunc( f + 1 )", "frac( f + 1 )", "exp( f + 1 )", "sqrt( f + 1 )", "abs( strlen( s ) )",
    "abs( numofchar( s ) )", "( abs( i + 1 ) )"];
  for (const expression of arithmetic) {
    for (const condition of [`c = ${expression}`, `${expression} = d`]) {
      it("error, " + condition, () => {
        const issues = issuesOf(`IF ${condition}.\nENDIF.`);
        expect(issues.length).to.equal(1);
        expect(issues[0]).to.include(message);
      });
    }
  }

  const between = ["1 BETWEEN c AND i + 1", "i BETWEEN d AND i + 1", "1 BETWEEN i + 1 AND c", "c BETWEEN 1 AND i + 1",
    "i + 1 BETWEEN 1 AND c"];
  for (const condition of between) {
    it("error, " + condition, () => {
      const issues = issuesOf(`IF ${condition}.\nENDIF.`);
      expect(issues.length).to.equal(1);
      expect(issues[0]).to.include(message);
    });
  }

  it("error, utclong against a calculation", () => {
    expect(issuesOf(`IF u = i + 1.\nENDIF.`)).to.deep.equal(
      ["A time stamp of type utclong cannot be compared with an arithmetic expression"]);
  });

  const ok = ["c = abs( i )", "c = sign( i )", "c = sqrt( f )", "c = exp( f )", "c = strlen( s )",
    "c = numofchar( s )", "( c ) = i", "c = ( i )", "( c ) = c", "i = ipow( base = i exp = 2 )",
    "i BETWEEN i + 1 AND abs( i )", "c BETWEEN 1 AND abs( i )"];
  for (const condition of ok) {
    it("ok, " + condition, () => {
      expect(issuesOf(`IF ${condition}.\nENDIF.`)).to.deep.equal([]);
    });
  }
});
