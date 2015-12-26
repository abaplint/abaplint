/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import Lexer from "../src/lexer";
import Parser from "../src/parser";
import Token from "../src/token";
import Report from "../src/report";
import Runner from "../src/runner";
import * as chai from "chai";
import * as fs from "fs";

let expect = chai.expect;

function helper(file: string): Parser {
    let buf = fs.readFileSync("./test/abap/" + file, "utf8");
    let parser = new Parser(new Lexer(buf));
    return parser;
}

describe("tokens", function() {
    let tests = [
        {file: "zhello01", tokens:  6},
        {file: "zhello02", tokens:  6},
        {file: "zhello03", tokens:  6},
        {file: "zhello04", tokens:  6},
        {file: "zhello05", tokens:  6},
        {file: "zhello06", tokens:  6},
        {file: "zhello07", tokens: 10},
        {file: "zhello08", tokens:  9},
        {file: "zhello09", tokens: 11},
        {file: "zhello10", tokens: 18},
    ];

    tests.forEach(function(test) {
        let tokens = helper(test.file + ".prog.abap").get_lexer().get_tokens();

        it(test.file + " should have " + test.tokens + " tokens", () => {
            expect(tokens.length).to.equals(test.tokens);
        });
    });
});

describe("statements", function() {
    let tests = [
        {file: "zhello01", statements: 2},
        {file: "zhello02", statements: 2},
        {file: "zhello03", statements: 2},
        {file: "zhello04", statements: 2},
        {file: "zhello05", statements: 2},
        {file: "zhello06", statements: 2},
        {file: "zhello07", statements: 3},
        {file: "zhello08", statements: 3},
        {file: "zhello09", statements: 3},
        {file: "zhello10", statements: 5},
        {file: "zif01",    statements: 4},
        {file: "zif02",    statements: 6},
        {file: "zif03",    statements: 8},
    ];

    tests.forEach(function(test) {
        let statements = helper(test.file + ".prog.abap").get_statements();

        it(test.file + " should have " + test.statements + " statements", () => {
            expect(statements.length).to.equals(test.statements);
        });
    });
});

describe("concat_tokens", function() {
    let tests = [
        "REPORT zfoo.",
        "WRITE 'Hello'.",
    ];

    tests.forEach(function(test) {
        it(test, () => {
            let parser = new Parser(new Lexer(test));
            let concat = parser.get_statements()[0].concat_tokens();
            expect(concat).to.equals(test);
        });
    });
});

describe("zero errors", function() {
    let tests = [
        {file: "zhello01", errors: 0},
        {file: "zhello02", errors: 0},
        {file: "zhello03", errors: 0},
        {file: "zhello04", errors: 0},
        {file: "zhello05", errors: 0},
        {file: "zhello06", errors: 0},
        {file: "zhello07", errors: 0},
        {file: "zhello08", errors: 0},
        {file: "zhello09", errors: 0},
        {file: "zhello10", errors: 0},
        {file: "zhello11", errors: 0},
        {file: "zif01", errors: 0},
        {file: "zif02", errors: 0},
        {file: "zif03", errors: 0},
    ];

    tests.forEach(function(test) {
        it(test.file + " should have zero errors", () => {
            let runner = new Runner("./test/abap/" + test.file + ".prog.abap");
            expect(runner.get_report().get_count()).to.equals(0);
        });
    });
});

describe("errors", function() {
    let tests = [
        {file: "zcheck01_01", errors: 1},
        {file: "zcheck02_01", errors: 1},
        {file: "zcheck02_02", errors: 1},
        {file: "zcheck03_01", errors: 1},
        {file: "zcheck03_02", errors: 1},
    ];

    tests.forEach(function(test) {
        it(test.file + " should have " + test.errors + " error(s)", () => {
            let runner = new Runner("./test/abap/" + test.file + ".prog.abap");
            expect(runner.get_report().get_count()).to.equals(test.errors);
        });
    });
});