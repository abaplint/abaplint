/* eslint-disable no-multi-spaces */
import {expect} from "chai";
import * as Combi from "../../src/abap/2_statements/combi";
import * as Tokens from "../../src/abap/1_lexer/tokens";
import * as Expressions from "../../src/abap/2_statements/expressions";
import {Position} from "../../src/position";
import {Token} from "../../src/abap/1_lexer/tokens/_token";
import {Result} from "../../src/abap/2_statements/result";

const str  = Combi.str;
const seq  = Combi.seqs;
const opt  = Combi.opts;
const star = Combi.stars;

function tok(s: string): Token[] {
  const split = s.split(" ");

  const tokens: Token[] = [];
  for (const st of split) {
    tokens.push(new Tokens.Identifier(new Position(10, 10), st));
  }

  return tokens;
}

function res(s: string) {
  return new Result(tok(s));
}

const resultSize = [
  {c: str("TEST"),                          in: [res("")],                          len: 0},
  {c: str("TEST"),                          in: [res("TEST")],                      len: 1},
  {c: str("TEST"),                          in: [res("FOO")],                       len: 0},
  {c: str("TEST"),                          in: [res("FOO"), res("TEST")],          len: 1},
  {c: seq(str("TEST"), str("FOO")),         in: [res("TEST FOO")],                  len: 1},
  {c: seq(str("TEST"), str("FOO")),         in: [res("TEST BAR")],                  len: 0},
  {c: seq(str("TEST"), str("FOO")),         in: [res("TEST FOO"), res("TEST BAR")], len: 1},
  {c: star(str("TEST")),                    in: [res("TEST TEST TEST")],            len: 4},
  {c: star(seq(str("TEST"), str("FOO"))),   in: [res("TEST FOO")],                  len: 2},
  {c: star(seq(str("TEST"), str("FOO"))),   in: [res("TEST FOO"), res("ASDF")],     len: 3},
  {c: opt(str("TEST")),                     in: [res("TEST")],                      len: 2},
  {c: star(new Expressions.ParameterListS()),     in: [res("TEST")],                      len: 1},
  {c: star(new Expressions.ParameterListS()),     in: [res("TEST BOO MOO")],              len: 1},
  {c: star(new Expressions.ParameterListS()),     in: [res("TEST = MOO")],                len: 2},
  {c: seq(str("TEST"), new Expressions.Source()), in: [res("TEST MOO")],                  len: 1},
  {c: new Expressions.ParameterS(),               in: [res("TEST = MOO")],                len: 1},
  {c: new Expressions.Source(),                   in: [res("TEST")],                      len: 1},
  {c: new Expressions.FieldChain(),               in: [res("TEST")],                      len: 1},
];

describe("combi Result size", () => {
  resultSize.forEach((test) => {
    it(test.c.toStr() + " should be size " + test.len, () => {
      const result = test.c.run(test.in);
      expect(result.length).to.equals(test.len);
    });
  });
});