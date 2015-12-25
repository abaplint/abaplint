/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import Lexer from "../src/lexer";
import Parser from "../src/parser";
import Token from "../src/token";
import Report from "../src/report";
import Check01 from "../src/check01";
import chai = require("chai");

let expect = chai.expect;
let fs = require("fs");

function helper(file: string): Parser {
    let buf = fs.readFileSync(__dirname + "/abap/" + file, "utf8");
    let lexer = new Lexer(buf);
    lexer.run();
    let parser = new Parser(lexer);
    parser.run();
    return parser;
}

describe("files, tokens", function() {
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

describe("files, statements", function() {
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

describe("check01", function() {
    let statements = helper("zcheck01.prog.abap").get_statements();
    let report = new Report();
    let check01 = new Check01(report);
    check01.run(statements);

    it("should have 1 error", () => {
        expect(report.get_count()).to.equals(1);
    });
});