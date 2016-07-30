import "../typings/index.d.ts";
import * as chai from "chai";
import * as Combi from "../src/combi";
import * as Tokens from "../src/tokens/";
import * as Statements from "../src/statements/";
import Reuse from "../src/statements/reuse";
import Position from "../src/position";
import File from "../src/file";
import Runner from "../src/runner";

let expect = chai.expect;

let str      = Combi.str;
let seq      = Combi.seq;
let alt      = Combi.alt;
let opt      = Combi.opt;
let star     = Combi.star;
let reg      = Combi.regex;
let re       = Combi.reuse;

function tok(s: string): Array<Tokens.Token> {
  let split = s.split(" ");

  let tokens: Array<Tokens.Token> = [];
  for (let st of split) {
    tokens.push(new Tokens.Identifier(new Position(10, 10), st));
  }

  return tokens;
}

let tests = [
  {c: "cs_tstcp",                 r: Reuse.field_chain()},
  {c: "cs_tstcp-param",           r: Reuse.field_chain()},
  {c: "cs_tstcp-param(sy)",       r: Reuse.field_chain()},
  {c: "cs_tstcp-param(sy-fdpos)", r: Reuse.field_chain()},
  {c: "cs_tstcp(sy-fdpos)",       r: Reuse.field_chain()},

  {c: "(sy)",                     r: Reuse.field_length()},
  {c: "(42)",                     r: Reuse.field_length()},
  {c: "(sy-fdpos)",               r: Reuse.field_length()},

  {c: "( lv_offset + 1 ) MOD 8",  r: Reuse.source()},
];

describe("Test reuse matchers", () => {
  tests.forEach((test) => {
    it(test.c + " should match " + test.r.get_name(), () => {
      let file = new File("temp.abap", test.c);
      Runner.run([file]);
// console.dir(file.getTokens());
      let match = Combi.Combi.run(test.r.get_runnable(), file.getTokens());
      expect(match).to.equals(true);
    });
  });
});