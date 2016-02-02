/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import File from "../src/file";
import Lexer from "../src/lexer";
import * as chai from "chai";
import * as fs from "fs";

let expect = chai.expect;

function helper(filename: string): File {
    let buf = fs.readFileSync("./test/abap/" + filename, "utf8");
    return new File(filename, buf);
}

describe("count_tokens", function() {
    let tests = [
        {file: "zhello01",    tokens:  6},
        {file: "zhello02",    tokens:  6},
        {file: "zhello03",    tokens:  6},
        {file: "zhello04",    tokens:  6},
        {file: "zhello05",    tokens:  6},
        {file: "zhello06",    tokens:  6},
        {file: "zhello07",    tokens: 10},
        {file: "zhello08",    tokens:  9},
        {file: "zhello09",    tokens: 11},
        {file: "zhello10",    tokens: 18},
        {file: "zhello12",    tokens:  6},
        {file: "zhello16",    tokens:  6},
        {file: "zhello17",    tokens:  6},
        {file: "zcomment01",  tokens:  4},
        {file: "zcomment02",  tokens:  4},
        {file: "zcomment03",  tokens:  7},
        {file: "zcheck07_01", tokens:  7},
        {file: "zpragma01",   tokens: 14},
    ];

    tests.forEach(function(test) {
        let tokens = helper(test.file + ".prog.abap").get_tokens();

        it(test.file + " should have " + test.tokens + " tokens", () => {
            expect(tokens.length).to.equals(test.tokens);
        });
    });
});

describe("count_tokens 2", function() {
    let tests = [
        {abap: "CALL METHOD (lv_class_name)=>jump.", tokens: 7},
        {abap: "DATA(lv_foo) = 5.",                  tokens: 7},
        {abap: "zcl_class=>method( ).",              tokens: 6},
    ];

    tests.forEach(function(test) {
        let file = new File("foo.abap", test.abap);
        new Lexer(file);

        it("\"" + test.abap + "\" should have " + test.tokens + " tokens", () => {
            expect(file.get_tokens().length).to.equals(test.tokens);
        });
    });
});