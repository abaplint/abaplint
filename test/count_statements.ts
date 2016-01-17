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

describe("count_statements", function() {
    let tests = [
        {file: "zhello01",   statements: 2},
        {file: "zhello02",   statements: 2},
        {file: "zhello03",   statements: 2},
        {file: "zhello04",   statements: 2},
        {file: "zhello05",   statements: 2},
        {file: "zhello06",   statements: 2},
        {file: "zhello07",   statements: 3},
        {file: "zhello08",   statements: 3},
        {file: "zhello09",   statements: 3},
        {file: "zhello10",   statements: 5},
        {file: "zif01",      statements: 4},
        {file: "zif02",      statements: 6},
        {file: "zif03",      statements: 8},
        {file: "zcomment01", statements: 2},
        {file: "zcomment02", statements: 2},
        {file: "zcomment03", statements: 3},
        {file: "zcomment04", statements: 3},
        {file: "zcomment05", statements: 4},
        {file: "zform01",    statements: 5},
        {file: "zselect01",  statements: 4},
    ];

    tests.forEach(function(test) {
        let statements = helper(test.file + ".prog.abap").get_statements();

        it(test.file + " should have " + test.statements + " statements", () => {
            expect(statements.length).to.equals(test.statements);
        });
    });
});