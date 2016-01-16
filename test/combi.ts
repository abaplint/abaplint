/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />

import * as chai from "chai";
import * as Combi from "../src/combi";

let expect = chai.expect;

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let token = Combi.token;

let tests = [
{name: "str1", combi: str("foo"), tokens: [token("foo")], expect: true},
{name: "str2", combi: str("foo"), tokens: [token("bar")], expect: false},
{name: "str3", combi: str("foo"), tokens: [], expect: false},
{name: "seq1", combi: seq(str("foo"), str("bar")), tokens: [token("foo"), token("bar")], expect: true},
{name: "seq2", combi: seq(str("foo"), str("bar")), tokens: [token("bar"), token("foo")], expect: false},
{name: "seq3", combi: seq(str("foo"), str("bar")), tokens: [token("foo")], expect: false},
{name: "seq4", combi: seq(str("foo"), str("bar")), tokens: [], expect: false},
{name: "alt1", combi: alt(str("foo"), str("bar")), tokens: [token("foo")], expect: true},
{name: "alt2", combi: alt(str("foo"), str("bar")), tokens: [token("bar")], expect: true},
{name: "alt3", combi: alt(str("foo"), str("bar")), tokens: [token("moo")], expect: false},
{name: "alt4", combi: alt(str("foo"), str("bar")), tokens: [], expect: false},
];

describe("combi", function() {
    tests.forEach(function(test) {
        it(test.name + " should be " + test.expect, () => {
            let result = Combi.Combi.run(test.combi, test.tokens);
            expect(result).to.equals(test.expect);
        });
    });
});