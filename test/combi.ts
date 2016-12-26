import * as chai from "chai";
import * as Combi from "../src/combi";
import * as Tokens from "../src/tokens/";
import Lexer from "../src/lexer";
import {File} from "../src/file";
import {Identifier, WPlusW, Plus} from "../src/tokens/";

let expect = chai.expect;

let str  = Combi.str;
let seq  = Combi.seq;
let alt  = Combi.alt;
let opt  = Combi.opt;
let plus = Combi.plus;
let star = Combi.star;
let reg  = Combi.regex;
let per  = Combi.per;
let tok  = Combi.tok;

function tokenize(s: string): Array<Tokens.Token> {
  return Lexer.run(new File("foo.abap", s));
}

let tests = [
{n: "str1", c: str("foo"),                        t: tokenize("foo"),     e: true},
{n: "str2", c: str("foo"),                        t: tokenize("bar"),     e: false},
{n: "str3", c: str("foo"),                        t: [],             e: false},
{n: "str4", c: str("DATA"),                       t: tokenize("data"),    e: true},
{n: "str5", c: str("foo bar"),                    t: tokenize("foo bar"), e: true},
{n: "seq1", c: seq(str("foo"), str("bar")),       t: tokenize("foo bar"), e: true},
{n: "seq2", c: seq(str("foo"), str("bar")),       t: tokenize("bar foo"), e: false},
{n: "seq3", c: seq(str("foo"), str("bar")),       t: tokenize("foo"),     e: false},
{n: "seq4", c: seq(str("foo"), str("bar")),       t: [],             e: false},
{n: "alt1", c: alt(str("foo"), str("bar")),       t: tokenize("foo"),     e: true},
{n: "alt2", c: alt(str("foo"), str("bar")),       t: tokenize("bar"),     e: true},
{n: "alt3", c: alt(str("foo"), str("bar")),       t: tokenize("moo"),     e: false},
{n: "alt4", c: alt(str("foo"), str("bar")),       t: [],                  e: false},
{n: "alt5", c: alt(str("foo"), str("bar")),       t: tokenize("foo foo"), e: false},
{n: "alt6", c: alt(str("bar"), opt(str("foo"))),  t: tokenize("foo foo"), e: false},
{n: "alt7", c: alt(str("bar"), plus(str("foo"))), t: tokenize("foo foo"), e: true},
{n: "alt8", c: alt(str("foo"), str("bar")),       t: tokenize("foo bar"), e: false},
{n: "alt9", c: alt(str("foo"), str("bar")),       t: tokenize("bar foo"), e: false},
{n: "opt1", c: opt(str("foo")),                   t: tokenize("foo"),     e: true},
{n: "opt3", c: seq(opt(str("foo")), str("bar")),  t: tokenize("foo bar"), e: true},
{n: "opt4", c: seq(opt(str("foo")), str("bar")),  t: tokenize("bar"),     e: true},
{n: "opt5", c: seq(opt(str("foo")), str("bar")),  t: tokenize("bar bar"), e: false},
{n: "opt6", c: seq(opt(str("foo")), str("bar")),  t: tokenize("foo"),     e: false},
{n: "opt7", c: seq(str("bar"), opt(str("foo"))),  t: tokenize("bar foo"), e: true},
{n: "opt8", c: seq(str("bar"), opt(str("foo"))),  t: tokenize("bar"),     e: true},
{n: "opt9", c: seq(str("bar"), opt(str("foo"))),  t: tokenize("foo foo"), e: false},
{n: "optA", c: seq(str("bar"), opt(str("foo"))),  t: tokenize("foo"),     e: false},
{n: "optB", c: opt(str("foo")),                   t: tokenize("bar"),     e: false},
{n: "sta1", c: star(str("bar")),                  t: [],             e: true},
{n: "sta2", c: star(str("bar")),                  t: tokenize("bar"),     e: true},
{n: "sta3", c: star(str("bar")),                  t: tokenize("bar bar"), e: true},
{n: "sta4", c: star(str("foo")),                  t: tokenize("bar"),     e: false},
{n: "sta5", c: star(str("foo")),                  t: tokenize("bar bar"), e: false},
{n: "sta6", c: seq(star(str("bar")), str("bar")), t: tokenize("bar bar"), e: true},
{n: "sta7", c: seq(star(str("bar")), str("foo")), t: tokenize("bar bar"), e: false},
{n: "sta8", c: seq(star(str("foo")), str("bar")), t: tokenize("bar bar"), e: false},
{n: "sta9", c: alt(star(str("bar")), str("bar")), t: tokenize("bar bar"), e: true},
{n: "staA", c: alt(star(str("bar")), str("foo")), t: tokenize("bar bar"), e: true},
{n: "staB", c: alt(str("bar"), star(str("bar"))), t: tokenize("bar bar"), e: true},
{n: "staC", c: alt(str("foo"), star(str("bar"))), t: tokenize("bar bar"), e: true},
{n: "staD", c: seq(str("foo"), star(str("bar"))), t: tokenize("foo bar"), e: true},
{n: "staE", c: seq(str("foo"), star(str("bar"))), t: tokenize("foo bar bar"), e: true},
{n: "staF", c: seq(str("foo"), star(str("bar"))), t: tokenize("foo bar bar bar"), e: true},
{n: "staG", c: seq(str("foo"), star(str("bar"))), t: tokenize("foo bar bar bar bar"), e: true},
{n: "reg1", c: reg(/^\w+$/),                      t: tokenize("foo"),     e: true},
{n: "reg2", c: reg(/^\w+$/),                      t: tokenize("foo!!"),   e: false},
{n: "reg3", c: reg(/^\w+$/),                      t: tokenize("foo bar"), e: false},
{n: "reg4", c: seq(reg(/^\w+$/), reg(/^\w+$/)),   t: tokenize("foo bar"), e: true},
{n: "reg5", c: reg(/^(LIKE|TYPE)$/i),             t: tokenize("type"),    e: true},
{n: "reg6", c: reg(/^(LIKE|TYPE)$/i),             t: tokenize("TYPE"),    e: true},
{n: "das1", c: str("FIELD-SYMBOL"),                  t: tokenize("FIELD - SYMBOL"), e: true},
{n: "per1", c: per(str("FOO"), str("BAR")),          t: tokenize("FOO"), e: true},
{n: "per2", c: per(str("FOO"), str("BAR")),          t: tokenize("BAR"), e: true},
{n: "per3", c: per(str("FOO"), str("BAR")),          t: tokenize("FOO BAR"), e: true},
{n: "per4", c: per(str("FOO"), str("BAR")),          t: tokenize("FOO FOO BAR"), e: false},
{n: "per5", c: per(str("FOO"), str("BAR")),          t: tokenize("BAR FOO"), e: true},
{n: "per6", c: per(str("FO"), str("BA"), str("MO")), t: tokenize("BA MO"), e: true},
{n: "per7", c: per(str("FO"), str("BA"), str("MO")), t: tokenize("MO BA"), e: true},
{n: "per8", c: per(str("FOO"), str("BAR")),          t: tokenize("MOO"), e: false},
{n: "per9", c: per(str("FOO"), str("BAR")),          t: tokenize("FOO BAR FOO"), e: false},
{n: "per9", c: per(str("FOO"), str("BAR")),          t: tokenize("FOO FOO"), e: false},
{n: "per9", c: per(str("FOO"), str("BAR")),          t: tokenize("BAR BAR"), e: false},
{n: "tok1", c: tok(Identifier),                      t: tokenize("FOO"), e: true},
{n: "tok2", c: seq(str("A"), tok(WPlusW), str("B")), t: tokenize("A + B"), e: true},
{n: "tok3", c: seq(str("A"), tok(Plus), str("B")),   t: tokenize("A+B"), e: true},
];

describe("combi matching", () => {
  tests.forEach((test) => {
    it(test.n + " should be " + test.e, () => {
      let result = Combi.Combi.run(test.c, test.t);
      expect(result !== undefined).to.equals(test.e);
    });
  });
});