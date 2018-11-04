import {expect} from "chai";
import * as Combi from "../src/abap/combi";
import * as Tokens from "../src/abap/tokens/";
import * as Expressions from "../src/abap/expressions";
import Position from "../src/position";
import {Token} from "../src/abap/tokens/_token";

let str  = Combi.str;
let seq  = Combi.seq;
let opt  = Combi.opt;
let star = Combi.star;

function tok(s: string): Array<Token> {
  let split = s.split(" ");

  let tokens: Array<Token> = [];
  for (let st of split) {
    tokens.push(new Tokens.Identifier(new Position(10, 10), st));
  }

  return tokens;
}

function res(s: string) {
  return new Combi.Result(tok(s));
}

let resultSize = [
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
      let result = test.c.run(test.in);
      expect(result.length).to.equals(test.len);
    });
  });
});