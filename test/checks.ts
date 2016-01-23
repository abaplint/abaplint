/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />

import Runner from "../src/runner";
import File from "../src/file";
import * as chai from "chai";
import * as fs from "fs";

let expect = chai.expect;

describe("errors", function() {
    let tests = [
        {file: "zcheck01_01", errors: 1},
        {file: "zcheck02_01", errors: 1},
        {file: "zcheck02_02", errors: 1},
        {file: "zcheck02_03", errors: 0},
        {file: "zcheck03_01", errors: 1},
        {file: "zcheck03_02", errors: 1},
        {file: "zcheck04_01", errors: 1},
        {file: "zcheck05_01", errors: 1},
        {file: "zcheck06_01", errors: 0},
        {file: "zcheck06_02", errors: 1},
        {file: "zcheck07_01", errors: 1},
        {file: "zcheck08_01", errors: 1},
        {file: "zcheck08_02", errors: 1},
        {file: "zcheck09_01", errors: 1},
        {file: "zcheck10_01", errors: 1},
        {file: "zcheck11_01", errors: 1},
        {file: "zcheck12_01", errors: 6},
    ];

    tests.forEach(function(test) {
        it(test.file + " should have " + test.errors + " error(s)", () => {
            let filename = "./test/abap/" + test.file + ".prog.abap";
            let file = new File(filename, fs.readFileSync(filename, "utf8"));
            let runner = new Runner(file);
            expect(runner.get_report().get_count()).to.equals(test.errors);
        });
    });
});