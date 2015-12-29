/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import Runner from "../src/runner";
import File from "../src/file";
import * as chai from "chai";
import * as fs from "fs";

let expect = chai.expect;

// TODO, split this file into multiple files

function helper(filename: string): File {
    let buf = fs.readFileSync("./test/abap/" + filename, "utf8");
    return new File(filename, buf);
}

describe("tokens", function() {
    let tests = [
        {file: "zhello01",   tokens:  6},
        {file: "zhello02",   tokens:  6},
        {file: "zhello03",   tokens:  6},
        {file: "zhello04",   tokens:  6},
        {file: "zhello05",   tokens:  6},
        {file: "zhello06",   tokens:  6},
        {file: "zhello07",   tokens: 10},
        {file: "zhello08",   tokens:  9},
        {file: "zhello09",   tokens: 11},
        {file: "zhello10",   tokens: 18},
        {file: "zcomment01", tokens:  4},
        {file: "zcomment02", tokens:  4},
        {file: "zcomment03", tokens:  7},
    ];

    tests.forEach(function(test) {
        let tokens = helper(test.file + ".prog.abap").get_tokens();

        it(test.file + " should have " + test.tokens + " tokens", () => {
            expect(tokens.length).to.equals(test.tokens);
        });
    });
});

describe("statements", function() {
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
            let file = new File("temp.abap", test);
            let concat = file.get_statements()[0].concat_tokens();
            expect(concat).to.equals(test);
        });
    });
});

describe("zero errors", function() {
    let tests = [
        "zhello01",
        "zhello02",
        "zhello03",
        "zhello04",
        "zhello05",
        "zhello06",
        "zhello07",
        "zhello08",
        "zhello09",
        "zhello10",
        "zhello11",
        "zif01",
        "zif02",
        "zif03",
        "zcomment01",
        "zcomment02",
        "zcomment03",
    ];

    tests.forEach(function(test) {
        it(test + " should have zero errors", () => {
            let runner = new Runner("./test/abap/" + test + ".prog.abap");
            expect(runner.get_report().get_count()).to.equals(0);
        });
    });
});

describe("errors", function() {
    let tests = [
        {file: "zcheck01_01", errors: 1},
        {file: "zcheck02_01", errors: 1},
        {file: "zcheck02_02", errors: 1},
        {file: "zcheck02_03", errors: 0},
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