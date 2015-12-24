/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import Lexer from "../src/lexer";
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

describe("tokens", () => {
    describe("zhello01.prog.abap", () => {
        it("should be 7", () => {
            let tokens = helper("zhello01.prog.abap").get_tokens();
            expect(tokens.length).to.equals(7);
        });
    });
});