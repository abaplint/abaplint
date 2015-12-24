/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import Lexer from "../src/lexer";
import Parser from "../src/parser";
import Token from "../src/token";
import chai = require("chai");

let expect = chai.expect;
let fs = require("fs");

function helper(file: string): Lexer {
    let buf = fs.readFileSync(__dirname + "/abap/" + file, "utf8");
    let lexer = new Lexer(buf);
    lexer.run();
    return lexer;
}

describe("files", function() {
    let tests = [
        {file: "zhello01", tokens: 6, statements: 2},
        {file: "zhello02", tokens: 6, statements: 2},
        {file: "zhello03", tokens: 6, statements: 2},
        {file: "zhello04", tokens: 6, statements: 2},
        {file: "zhello05", tokens: 6, statements: 2},
        {file: "zhello06", tokens: 6, statements: 2},
        {file: "zhello07", tokens: 10, statements: 3},
    ];

    tests.forEach(function(test) {
        let lexer = helper(test.file + ".prog.abap");
        let tokens = lexer.get_tokens();
        let parser = new Parser(lexer);
        let statements = parser.run();

        it(test.file + " should be " + test.tokens + " tokens", () => {
            expect(tokens.length).to.equals(test.tokens);
        });
        it(test.file + " should be " + test.statements + " statements", () => {
            expect(statements.length).to.equals(test.statements);
        });
    });
});