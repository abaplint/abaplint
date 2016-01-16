/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />

import * as chai from "chai";
import * as Combi from "../src/combi";

let expect = chai.expect;

let str      = Combi.str;
let seq      = Combi.seq;
let alt      = Combi.alt;
let anything = Combi.anything;
let tok      = Combi.token;
let nothing  = Combi.nothing;
let opt      = Combi.opt;
let star     = Combi.star;
let reg      = Combi.regex;

let tests = [
{n: "no1",  c: nothing(),                         t: [tok("bar")],             e: false},
{n: "no2",  c: nothing(),                         t: [],                       e: false},
{n: "str1", c: str("foo"),                        t: [tok("foo")],             e: true},
{n: "str2", c: str("foo"),                        t: [tok("bar")],             e: false},
{n: "str3", c: str("foo"),                        t: [],                       e: false},
{n: "str4", c: str("DATA"),                       t: [tok("data")],            e: true},
{n: "seq1", c: seq(str("foo"), str("bar")),       t: [tok("foo"), tok("bar")], e: true},
{n: "seq2", c: seq(str("foo"), str("bar")),       t: [tok("bar"), tok("foo")], e: false},
{n: "seq3", c: seq(str("foo"), str("bar")),       t: [tok("foo")],             e: false},
{n: "seq4", c: seq(str("foo"), str("bar")),       t: [],                       e: false},
{n: "alt1", c: alt(str("foo"), str("bar")),       t: [tok("foo")],             e: true},
{n: "alt2", c: alt(str("foo"), str("bar")),       t: [tok("bar")],             e: true},
{n: "alt3", c: alt(str("foo"), str("bar")),       t: [tok("moo")],             e: false},
{n: "alt4", c: alt(str("foo"), str("bar")),       t: [],                       e: false},
{n: "any1", c: anything(),                        t: [tok("foo")],             e: true},
{n: "any2", c: anything(),                        t: [tok("foo"), tok("bar")], e: true},
{n: "any3", c: anything(),                        t: [],                       e: true},
{n: "any4", c: seq(str("foo"), anything()),       t: [tok("foo"), tok("bar")], e: true},
{n: "any4", c: seq(str("foo"), anything()),       t: [tok("foo")],             e: true},
{n: "any5", c: seq(str("foo"), anything()),       t: [],                       e: false},
{n: "any6", c: seq(str("foo"), anything()),       t: [tok("bar"), tok("bar")], e: false},
{n: "any7", c: seq(str("foo"), anything()),       t: [tok("bar")],             e: false},
{n: "any8", c: seq(anything(), str("foo")),       t: [tok("foo"), tok("bar")], e: false},
{n: "any9", c: seq(anything(), str("foo")),       t: [tok("foo")],             e: true},
{n: "anyA", c: seq(anything(), str("foo")),       t: [tok("foo"), tok("foo")], e: true},
{n: "anyB", c: seq(anything(), str("foo")),       t: [],                       e: false},
{n: "anyC", c: seq(anything(), str("foo")),       t: [tok("bar"), tok("bar")], e: false},
{n: "anyD", c: seq(anything(), str("foo")),       t: [tok("bar")],             e: false},
{n: "opt1", c: opt(str("foo")),                   t: [tok("foo")],             e: true},
{n: "opt2", c: opt(anything()),                   t: [tok("foo")],             e: true},
{n: "opt3", c: seq(opt(str("foo")), str("bar")),  t: [tok("foo"), tok("bar")], e: true},
{n: "opt4", c: seq(opt(str("foo")), str("bar")),  t: [tok("bar")],             e: true},
{n: "opt5", c: seq(opt(str("foo")), str("bar")),  t: [tok("bar"), tok("bar")], e: false},
{n: "opt6", c: seq(opt(str("foo")), str("bar")),  t: [tok("foo")],             e: false},
{n: "opt7", c: seq(str("bar"), opt(str("foo"))),  t: [tok("bar"), tok("foo")], e: true},
{n: "opt8", c: seq(str("bar"), opt(str("foo"))),  t: [tok("bar")],             e: true},
{n: "opt9", c: seq(str("bar"), opt(str("foo"))),  t: [tok("foo"), tok("foo")], e: false},
{n: "optA", c: seq(str("bar"), opt(str("foo"))),  t: [tok("foo")],             e: false},
{n: "optB", c: opt(str("foo")),                   t: [tok("bar")],             e: false},
{n: "st1",  c: star(str("bar")),                  t: [],                       e: true},
{n: "st2",  c: star(str("bar")),                  t: [tok("bar")],             e: true},
{n: "st3",  c: star(str("bar")),                  t: [tok("bar"), tok("bar")], e: true},
{n: "st4",  c: star(str("foo")),                  t: [tok("bar")],             e: false},
{n: "st5",  c: star(str("foo")),                  t: [tok("bar"), tok("bar")], e: false},
{n: "st6",  c: seq(star(str("bar")), str("bar")), t: [tok("bar"), tok("bar")], e: true},
{n: "st7",  c: seq(star(str("bar")), str("foo")), t: [tok("bar"), tok("bar")], e: false},
{n: "st8",  c: seq(star(str("foo")), str("bar")), t: [tok("bar"), tok("bar")], e: false},
{n: "st9",  c: alt(star(str("bar")), str("bar")), t: [tok("bar"), tok("bar")], e: true},
{n: "stA",  c: alt(star(str("bar")), str("foo")), t: [tok("bar"), tok("bar")], e: true},
{n: "stB",  c: alt(str("bar"), star(str("bar"))), t: [tok("bar"), tok("bar")], e: true},
{n: "stC",  c: alt(str("foo"), star(str("bar"))), t: [tok("bar"), tok("bar")], e: true},
{n: "reg1", c: reg(/^\w+$/),                      t: [tok("foo")],             e: true},
{n: "reg2", c: reg(/^\w+$/),                      t: [tok("foo!!")],           e: false},
{n: "reg3", c: reg(/^\w+$/),                      t: [tok("foo"), tok("bar")], e: false},
{n: "reg4", c: seq(reg(/^\w+$/), reg(/^\w+$/)),   t: [tok("foo"), tok("bar")], e: true},
];

describe("combi", function() {
    tests.forEach(function(test) {
        it(test.n + " should be " + test.e, () => {
            let result = Combi.Combi.run(test.c, test.t);
            expect(result).to.equals(test.e);
        });
    });
});