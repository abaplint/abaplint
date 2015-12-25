/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import Lexer from "../src/lexer";
import Parser from "../src/parser";
import Token from "../src/token";
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

describe("files, tokens and statements", function() {
    let tests = [
        {file: "zhello01", tokens:  6, statements: 2},
        {file: "zhello02", tokens:  6, statements: 2},
        {file: "zhello03", tokens:  6, statements: 2},
        {file: "zhello04", tokens:  6, statements: 2},
        {file: "zhello05", tokens:  6, statements: 2},
        {file: "zhello06", tokens:  6, statements: 2},
        {file: "zhello07", tokens: 10, statements: 3},
        {file: "zhello08", tokens:  9, statements: 3},
        {file: "zhello09", tokens: 11, statements: 3},
        {file: "zhello10", tokens: 18, statements: 5},
    ];

    tests.forEach(function(test) {
        let parser = helper(test.file + ".prog.abap");
        let tokens = parser.get_lexer().get_tokens();
        let statements = parser.get_statements();

        it(test.file + " should be " + test.tokens + " tokens", () => {
            expect(tokens.length).to.equals(test.tokens);
        });
        it(test.file + " should be " + test.statements + " statements", () => {
            expect(statements.length).to.equals(test.statements);
        });
    });
});

describe("files, statements", function() {
    let tests = [
        {file: "zif01", statements: 4},
        {file: "zif02", statements: 6},
        {file: "zif03", statements: 8},
    ];

    tests.forEach(function(test) {
        let statements = helper(test.file + ".prog.abap").get_statements();

        it(test.file + " should be " + test.statements + " statements", () => {
            expect(statements.length).to.equals(test.statements);
        });
    });
});