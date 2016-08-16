import "../typings/index.d.ts";
import * as chai from "chai";
import * as Combi from "../src/combi";
import * as Tokens from "../src/tokens/";
import Reuse from "../src/statements/reuse";
import Position from "../src/position";

let expect = chai.expect;

let str      = Combi.str;
let seq      = Combi.seq;
let opt      = Combi.opt;
let star     = Combi.star;

function tok(s: string): Array<Tokens.Token> {
  let split = s.split(" ");

  let tokens: Array<Tokens.Token> = [];
  for (let st of split) {
    tokens.push(new Tokens.Identifier(new Position(10, 10), st));
  }

  return tokens;
}

function res(s: string) {
  return new Combi.Result(tok(s));
}

let resultSize = [
  {c: str("TEST"),                        in: [res("")],                          len: 0},
  {c: str("TEST"),                        in: [res("TEST")],                      len: 1},
  {c: str("TEST"),                        in: [res("FOO")],                       len: 0},
  {c: str("TEST"),                        in: [res("FOO"), res("TEST")],          len: 1},
  {c: seq(str("TEST"), str("FOO")),       in: [res("TEST FOO")],                  len: 1},
  {c: seq(str("TEST"), str("FOO")),       in: [res("TEST BAR")],                  len: 0},
  {c: seq(str("TEST"), str("FOO")),       in: [res("TEST FOO"), res("TEST BAR")], len: 1},
  {c: star(str("TEST")),                  in: [res("TEST TEST TEST")],            len: 4},
  {c: star(seq(str("TEST"), str("FOO"))), in: [res("TEST FOO")],                  len: 2},
  {c: star(seq(str("TEST"), str("FOO"))), in: [res("TEST FOO"), res("ASDF")],     len: 3},
  {c: opt(str("TEST")),                   in: [res("TEST")],                      len: 2},
  {c: star(Reuse.parameter_list_s()),     in: [res("TEST")],                      len: 1},
  {c: star(Reuse.parameter_list_s()),     in: [res("TEST BOO MOO")],              len: 1},
  {c: star(Reuse.parameter_list_s()),     in: [res("TEST = MOO")],                len: 2},
  {c: seq(str("TEST"), Reuse.source()),   in: [res("TEST MOO")],                  len: 1},
  {c: Reuse.parameter_s(),                in: [res("TEST = MOO")],                len: 1},
  {c: Reuse.source(),                     in: [res("TEST")],                      len: 1},
  {c: Reuse.field_chain(),                in: [res("TEST")],                      len: 1},
];

describe("combi Result size", () => {
  resultSize.forEach((test) => {
    it(test.c.toStr() + " should be size " + test.len, () => {
      let result = test.c.run(test.in);
      expect(result.length).to.equals(test.len);
    });
  });
});