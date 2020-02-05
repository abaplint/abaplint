import {expect} from "chai";
import * as Combi from "../../src/abap/combi";
import {Lexer} from "../../src/abap/lexer";
import {MemoryFile} from "../../src/files";
import {Identifier, WPlusW, Plus} from "../../src/abap/tokens";
import {Token} from "../../src/abap/tokens/_token";

const str  = Combi.str;
const per  = Combi.per;
const seq  = Combi.seq;
const alt  = Combi.alt;
const opt  = Combi.opt;
const plus = Combi.plus;
const star = Combi.star;
const reg  = Combi.regex;
const tok  = Combi.tok;
const optPrio = Combi.optPrio;
const starPrio = Combi.starPrio;

function tokenize(s: string): Token[] {
  return Lexer.run(new MemoryFile("foo.abap", s));
}

const tests = [
  {n: "str1", c: str("foo"),                        t: tokenize("foo"),     e: true, len: 1},
  {n: "str2", c: str("foo"),                        t: tokenize("bar"),     e: false, len: 0},
  {n: "str3", c: str("foo"),                        t: [],                  e: false},
  {n: "str4", c: str("DATA"),                       t: tokenize("data"),    e: true},
  {n: "str5", c: str("foo bar"),                    t: tokenize("foo bar"), e: true},
  {n: "seq1", c: seq(str("foo"), str("bar")),       t: tokenize("foo bar"), e: true},
  {n: "seq2", c: seq(str("foo"), str("bar")),       t: tokenize("bar foo"), e: false},
  {n: "seq3", c: seq(str("foo"), str("bar")),       t: tokenize("foo"),     e: false},
  {n: "seq4", c: seq(str("foo"), str("bar")),       t: [],                  e: false},
  {n: "alt1", c: alt(str("foo"), str("bar")),       t: tokenize("foo"),     e: true},
  {n: "alt2", c: alt(str("foo"), str("bar")),       t: tokenize("bar"),     e: true},
  {n: "alt3", c: alt(str("foo"), str("bar")),       t: tokenize("moo"),     e: false},
  {n: "alt4", c: alt(str("foo"), str("bar")),       t: [],                  e: false},
  {n: "alt5", c: alt(str("foo"), str("bar")),       t: tokenize("foo foo"), e: false},
  {n: "alt6", c: alt(str("bar"), opt(str("foo"))),  t: tokenize("foo foo"), e: false},
  {n: "alt7", c: alt(str("bar"), plus(str("foo"))), t: tokenize("foo foo"), e: true},
  {n: "alt8", c: alt(str("foo"), str("bar")),       t: tokenize("foo bar"), e: false},
  {n: "alt9", c: alt(str("foo"), str("bar")),       t: tokenize("bar foo"), e: false},
  {n: "opt1", c: opt(str("foo")),                   t: tokenize("foo"),     e: true, len: 2},
  {n: "opt3", c: seq(opt(str("foo")), str("bar")),  t: tokenize("foo bar"), e: true},
  {n: "opt4", c: seq(opt(str("foo")), str("bar")),  t: tokenize("bar"),     e: true},
  {n: "opt5", c: seq(opt(str("foo")), str("bar")),  t: tokenize("bar bar"), e: false},
  {n: "opt6", c: seq(opt(str("foo")), str("bar")),  t: tokenize("foo"),     e: false},
  {n: "opt7", c: seq(str("bar"), opt(str("foo"))),  t: tokenize("bar foo"), e: true},
  {n: "opt8", c: seq(str("bar"), opt(str("foo"))),  t: tokenize("bar"),     e: true},
  {n: "opt9", c: seq(str("bar"), opt(str("foo"))),  t: tokenize("foo foo"), e: false},
  {n: "optA", c: seq(str("bar"), opt(str("foo"))),  t: tokenize("foo"),     e: false},
  {n: "optB", c: opt(str("foo")),                   t: tokenize("bar"),     e: false},
  {n: "sta1", c: star(str("bar")),                  t: [],                  e: true},
  {n: "sta2", c: star(str("bar")),                  t: tokenize("bar"),     e: true},
  {n: "sta3", c: star(str("bar")),                  t: tokenize("bar bar"), e: true},
  {n: "sta4", c: star(str("foo")),                  t: tokenize("bar"),     e: false},
  {n: "sta5", c: star(str("foo")),                  t: tokenize("bar bar"), e: false},
  {n: "stp1", c: starPrio(str("bar")),                  t: [],                  e: true},
  {n: "stp2", c: starPrio(str("bar")),                  t: tokenize("bar"),     e: true},
  {n: "stp3", c: starPrio(str("bar")),                  t: tokenize("bar bar"), e: true},
  {n: "stp4", c: starPrio(str("foo")),                  t: tokenize("bar"),     e: false},
  {n: "stp5", c: starPrio(str("foo")),                  t: tokenize("bar bar"), e: false},
  {n: "stp6", c: seq(starPrio(str("bar")), str("foo")), t: tokenize("bar bar foo"), e: true},
  {n: "sta6", c: seq(star(str("bar")), str("bar")), t: tokenize("bar bar"), e: true},
  {n: "sta7", c: seq(star(str("bar")), str("foo")), t: tokenize("bar bar"), e: false},
  {n: "sta8", c: seq(star(str("foo")), str("bar")), t: tokenize("bar bar"), e: false},
  {n: "sta9", c: alt(star(str("bar")), str("bar")), t: tokenize("bar bar"), e: true},
  {n: "staA", c: alt(star(str("bar")), str("foo")), t: tokenize("bar bar"), e: true},
  {n: "staB", c: alt(str("bar"), star(str("bar"))), t: tokenize("bar bar"), e: true},
  {n: "staC", c: alt(str("foo"), star(str("bar"))), t: tokenize("bar bar"), e: true},
  {n: "staD", c: seq(str("foo"), star(str("bar"))), t: tokenize("foo bar"), e: true},
  {n: "staE", c: seq(str("foo"), star(str("bar"))), t: tokenize("foo bar bar"),         e: true},
  {n: "staF", c: seq(str("foo"), star(str("bar"))), t: tokenize("foo bar bar bar"),     e: true},
  {n: "staG", c: seq(str("foo"), star(str("bar"))), t: tokenize("foo bar bar bar bar"), e: true},
  {n: "reg1", c: reg(/^\w+$/),                         t: tokenize("foo"),            e: true},
  {n: "reg2", c: reg(/^\w+$/),                         t: tokenize("foo!!"),          e: false},
  {n: "reg3", c: reg(/^\w+$/),                         t: tokenize("foo bar"),        e: false},
  {n: "reg4", c: seq(reg(/^\w+$/), reg(/^\w+$/)),      t: tokenize("foo bar"),        e: true},
  {n: "reg5", c: reg(/^(LIKE|TYPE)$/i),                t: tokenize("type"),           e: true},
  {n: "reg6", c: reg(/^(LIKE|TYPE)$/i),                t: tokenize("TYPE"),           e: true},
  {n: "reg7", c: reg(/^#?\w+$/),                       t: tokenize("#1"),             e: true},
  {n: "das1", c: str("FIELD-SYMBOL"),                  t: tokenize("FIELD - SYMBOL"), e: true},
  {n: "per1", c: per(str("FOO"), str("BAR")),          t: tokenize("FOO"),            e: true, len: 1},
  {n: "per2", c: per(str("FOO"), str("BAR")),          t: tokenize("BAR"),            e: true},
  {n: "per3", c: per(str("FOO"), str("BAR")),          t: tokenize("FOO BAR"),        e: true},
  {n: "per4", c: per(str("FOO"), str("BAR")),          t: tokenize("FOO FOO BAR"),    e: false},
  {n: "per5", c: per(str("FOO"), str("BAR")),          t: tokenize("BAR FOO"),        e: true},
  {n: "per6", c: per(str("FO"), str("BA"), str("MO")), t: tokenize("BA MO"),          e: true},
  {n: "per7a", c: per(str("FO"), str("BA"), str("MO")), t: tokenize("FO BA"),         e: true, len: 2},
  {n: "per7b", c: per(str("FO"), str("BA"), str("MO")), t: tokenize("MO BA"),         e: true, len: 2},
  {n: "per8", c: per(str("FOO"), str("BAR")),          t: tokenize("MOO"),            e: false},
  {n: "per9", c: per(str("FOO"), str("BAR")),          t: tokenize("FOO BAR FOO"),    e: false},
  {n: "per9", c: per(str("FOO"), str("BAR")),          t: tokenize("FOO FOO"),        e: false},
  {n: "perA", c: per(str("FOO"), str("BAR")),          t: tokenize("BAR BAR"),        e: false},
  {n: "perB", c: seq(per(str("A"), str("B")), str("M")), t: tokenize("M"),            e: false},
  {n: "tok1", c: tok(Identifier),                      t: tokenize("FOO"),            e: true},
  {n: "tok2", c: seq(str("A"), tok(WPlusW), str("B")), t: tokenize("A + B"),          e: true},
  {n: "tok3", c: seq(str("A"), tok(Plus), str("B")),   t: tokenize("A+B"),            e: true},
  {n: "plus1", c: plus(str("A")),                      t: tokenize("A"),              e: true, len: 1},
  {n: "plus2", c: plus(str("A")),                      t: tokenize("A A"),            e: true, len: 2},
  {n: "plus3", c: plus(str("A")),                      t: tokenize(""),               e: false},
  {n: "plus4", c: plus(str("A")),                      t: tokenize("B"),              e: false},
  {n: "plus5", c: plus(str("A")),                      t: tokenize("A B"),            e: false},
  {n: "plus6", c: seq(plus(str("A")), str("B")),       t: tokenize("A B"),            e: true, len: 1},
  {n: "plus7", c: seq(plus(str("A")), str("B")),       t: tokenize("A A B"),          e: true},
  {n: "oprio1", c: optPrio(str("A")),                  t: tokenize("A"),              e: true, len: 1},
  {n: "oprio2", c: optPrio(str("B")),                  t: tokenize("A"),              e: false, len: 1},
  {n: "oprio3", c: seq(str("B"), optPrio(str("A"))),   t: tokenize("B A"),            e: true, len: 1},
  {n: "oprio4", c: seq(str("B"), optPrio(str("A"))),   t: tokenize("B B"),            e: false, len: 1},
  {n: "foo1", c: alt(seq(str("A"), str("A")), seq(str("A"), str("B"))),   t: tokenize("A A"),            e: true, len: 1},
];

describe("combi matching -", () => {
  tests.forEach((test) => {
    it(test.n, () => {
      const input = new Combi.Result(test.t);
      const result = test.c.run([input]);
//      console.log("final result");
//      console.dir(result);
      let match = false;
      for (const res of result) {
        if (res.length() === 0) {
          match = true;
        }
      }
//      let result = Combi.Combi.run(test.c, test.t);
      expect(match).to.equals(test.e);

      if (test["len"] !== undefined) {
        expect(test["len"]).to.equals(result.length);
      }
    });
  });
});