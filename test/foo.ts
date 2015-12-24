/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import Lexer from "../src/lexer";
import Token from "../src/token";
import chai = require("chai");

let expect = chai.expect;
let fs = require("fs");

describe("zhello.prog.abap", () => {
    let tokens: Array<Token>;

    beforeEach(function () {
        let buf = fs.readFileSync(__dirname + "/abap/zhello.prog.abap", "utf8");
        let lexer: Lexer;
        lexer = new Lexer(buf);
        tokens = lexer.run();
    });

    describe("tokens", () => {
        it("should be 7", () => {
            expect(tokens.length).to.equals(7);
        });
    });
});