/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import File from "../src/file";
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
        {file: "zpragma01",   tokens: 12},
    ];

    tests.forEach(function(test) {
        let tokens = helper(test.file + ".prog.abap").get_tokens();

        it(test.file + " should have " + test.tokens + " tokens", () => {
            expect(tokens.length).to.equals(test.tokens);
        });
    });
});