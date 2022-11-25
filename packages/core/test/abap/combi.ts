/* eslint-disable no-multi-spaces */
import {expect} from "chai";
import * as Combi from "../../src/abap/2_statements/combi";
import {Lexer} from "../../src/abap/1_lexer/lexer";
import {Identifier, WPlusW, Plus} from "../../src/abap/1_lexer/tokens";
import {Result} from "../../src/abap/2_statements/result";
import {MemoryFile} from "../../src/files/memory_file";

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

const tests = [
  {n: "str1", c: str("foo"),                        t: "foo",     e: true, len: 1},
  {n: "str2", c: str("foo"),                        t: "bar",     e: false, len: 0},
  {n: "str3", c: str("foo"),                        t: "",                  e: false},
  {n: "str4", c: str("DATA"),                       t: "data",    e: true},
  {n: "str5", c: str("foo bar"),                    t: "foo bar", e: true},
  {n: "seq1", c: seq(str("foo"), str("bar")),       t: "foo bar", e: true},
  {n: "seq2", c: seq(str("foo"), str("bar")),       t: "bar foo", e: false},
  {n: "seq3", c: seq(str("foo"), str("bar")),       t: "foo",     e: false},
  {n: "seq4", c: seq(str("foo"), str("bar")),       t: "",                  e: false},
  {n: "alt1", c: alt(str("foo"), str("bar")),       t: "foo",     e: true},
  {n: "alt2", c: alt(str("foo"), str("bar")),       t: "bar",     e: true},
  {n: "alt3", c: alt(str("foo"), str("bar")),       t: "moo",     e: false},
  {n: "alt4", c: alt(str("foo"), str("bar")),       t: "",                  e: false},
  {n: "alt5", c: alt(str("foo"), str("bar")),       t: "foo foo", e: false},
  {n: "alt6", c: alt(str("bar"), opt(str("foo"))),  t: "foo foo", e: false},
  {n: "alt7", c: alt(str("bar"), plus(str("foo"))), t: "foo foo", e: true},
  {n: "alt8", c: alt(str("foo"), str("bar")),       t: "foo bar", e: false},
  {n: "alt9", c: alt(str("foo"), str("bar")),       t: "bar foo", e: false},
  {n: "opt1", c: opt(str("foo")),                   t: "foo",     e: true, len: 2},
  {n: "opt3", c: seq(opt(str("foo")), str("bar")),  t: "foo bar", e: true},
  {n: "opt4", c: seq(opt(str("foo")), str("bar")),  t: "bar",     e: true},
  {n: "opt5", c: seq(opt(str("foo")), str("bar")),  t: "bar bar", e: false},
  {n: "opt6", c: seq(opt(str("foo")), str("bar")),  t: "foo",     e: false},
  {n: "opt7", c: seq(str("bar"), opt(str("foo"))),  t: "bar foo", e: true},
  {n: "opt8", c: seq(str("bar"), opt(str("foo"))),  t: "bar",     e: true},
  {n: "opt9", c: seq(str("bar"), opt(str("foo"))),  t: "foo foo", e: false},
  {n: "optA", c: seq(str("bar"), opt(str("foo"))),  t: "foo",     e: false},
  {n: "optB", c: opt(str("foo")),                   t: "bar",     e: false},
  {n: "sta1", c: star(str("bar")),                  t: "",                  e: true},
  {n: "sta2", c: star(str("bar")),                  t: "bar",     e: true},
  {n: "sta3", c: star(str("bar")),                  t: "bar bar", e: true},
  {n: "sta4", c: star(str("foo")),                  t: "bar",     e: false},
  {n: "sta5", c: star(str("foo")),                  t: "bar bar", e: false},
  {n: "stp1", c: starPrio(str("bar")),                  t: "",                  e: true},
  {n: "stp2", c: starPrio(str("bar")),                  t: "bar",     e: true},
  {n: "stp3", c: starPrio(str("bar")),                  t: "bar bar", e: true},
  {n: "stp4", c: starPrio(str("foo")),                  t: "bar",     e: false},
  {n: "stp5", c: starPrio(str("foo")),                  t: "bar bar", e: false},
  {n: "stp6", c: seq(starPrio(str("bar")), str("foo")), t: "bar bar foo", e: true},
  {n: "sta6", c: seq(star(str("bar")), str("bar")), t: "bar bar", e: true},
  {n: "sta7", c: seq(star(str("bar")), str("foo")), t: "bar bar", e: false},
  {n: "sta8", c: seq(star(str("foo")), str("bar")), t: "bar bar", e: false},
  {n: "sta9", c: alt(star(str("bar")), str("bar")), t: "bar bar", e: true},
  {n: "staA", c: alt(star(str("bar")), str("foo")), t: "bar bar", e: true},
  {n: "staB", c: alt(str("bar"), star(str("bar"))), t: "bar bar", e: true},
  {n: "staC", c: alt(str("foo"), star(str("bar"))), t: "bar bar", e: true},
  {n: "staD", c: seq(str("foo"), star(str("bar"))), t: "foo bar", e: true},
  {n: "staE", c: seq(str("foo"), star(str("bar"))), t: "foo bar bar",         e: true},
  {n: "staF", c: seq(str("foo"), star(str("bar"))), t: "foo bar bar bar",     e: true},
  {n: "staG", c: seq(str("foo"), star(str("bar"))), t: "foo bar bar bar bar", e: true},
  {n: "reg1", c: reg(/^\w+$/),                         t: "foo",            e: true},
  {n: "reg2", c: reg(/^\w+$/),                         t: "foo!!",          e: false},
  {n: "reg3", c: reg(/^\w+$/),                         t: "foo bar",        e: false},
  {n: "reg4", c: seq(reg(/^\w+$/), reg(/^\w+$/)),      t: "foo bar",        e: true},
  {n: "reg5", c: reg(/^(LIKE|TYPE)$/i),                t: "type",           e: true},
  {n: "reg6", c: reg(/^(LIKE|TYPE)$/i),                t: "TYPE",           e: true},
  {n: "reg7", c: reg(/^#?\w+$/),                       t: "#1",             e: true},
  {n: "das1", c: str("FIELD-SYMBOL"),                  t: "FIELD - SYMBOL", e: true},
  {n: "per1", c: per(str("FOO"), str("BAR")),          t: "FOO",            e: true, len: 1},
  {n: "per2", c: per(str("FOO"), str("BAR")),          t: "BAR",            e: true},
  {n: "per3", c: per(str("FOO"), str("BAR")),          t: "FOO BAR",        e: true},
  {n: "per4", c: per(str("FOO"), str("BAR")),          t: "FOO FOO BAR",    e: false},
  {n: "per5", c: per(str("FOO"), str("BAR")),          t: "BAR FOO",        e: true},
  {n: "per6", c: per(str("FO"), str("BA"), str("MO")), t: "BA MO",          e: true},
  {n: "per7a", c: per(str("FO"), str("BA"), str("MO")), t: "FO BA",         e: true, len: 2},
  {n: "per7b", c: per(str("FO"), str("BA"), str("MO")), t: "MO BA",         e: true, len: 2},
  {n: "per8", c: per(str("FOO"), str("BAR")),          t: "MOO",            e: false},
  {n: "per9", c: per(str("FOO"), str("BAR")),          t: "FOO BAR FOO",    e: false},
  {n: "per9", c: per(str("FOO"), str("BAR")),          t: "FOO FOO",        e: false},
  {n: "perA", c: per(str("FOO"), str("BAR")),          t: "BAR BAR",        e: false},
  {n: "perB", c: seq(per(str("A"), str("B")), str("M")), t: "M",            e: false},
  {n: "tok1", c: tok(Identifier),                      t: "FOO",            e: true},
  {n: "tok2", c: seq(str("A"), tok(WPlusW), str("B")), t: "A + B",          e: true},
  {n: "tok3", c: seq(str("A"), tok(Plus), str("B")),   t: "A+B",            e: true},
  {n: "plus1", c: plus(str("A")),                      t: "A",              e: true, len: 1},
  {n: "plus2", c: plus(str("A")),                      t: "A A",            e: true, len: 2},
  {n: "plus3", c: plus(str("A")),                      t: "",               e: false},
  {n: "plus4", c: plus(str("A")),                      t: "B",              e: false},
  {n: "plus5", c: plus(str("A")),                      t: "A B",            e: false},
  {n: "plus6", c: seq(plus(str("A")), str("B")),       t: "A B",            e: true, len: 1},
  {n: "plus7", c: seq(plus(str("A")), str("B")),       t: "A A B",          e: true},
  {n: "oprio1", c: optPrio(str("A")),                  t: "A",              e: true, len: 1},
  {n: "oprio2", c: optPrio(str("B")),                  t: "A",              e: false, len: 1},
  {n: "oprio3", c: seq(str("B"), optPrio(str("A"))),   t: "B A",            e: true, len: 1},
  {n: "oprio4", c: seq(str("B"), optPrio(str("A"))),   t: "B B",            e: false, len: 1},
  {n: "foo1", c: alt(seq(str("A"), str("A")), seq(str("A"), str("B"))),   t: "A A",            e: true, len: 1},
];

describe("combi matching -", () => {
  tests.forEach((test) => {
    it(test.n, () => {
      const tokens = new Lexer().run(new MemoryFile("foo.abap", test.t)).tokens;
      const input = new Result(tokens, 0);
      const result = test.c.run([input]);
      let match = false;
      for (const res of result) {
        if (res.remainingLength() === 0) {
          match = true;
        }
      }
      expect(match).to.equals(test.e);

      if (test["len"] !== undefined) {
        expect(test["len"]).to.equals(result.length);
      }
    });
  });
});

