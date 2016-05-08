/// <reference path="./typings/mocha/mocha.d.ts"/>
/// <reference path="./typings/chai/chai.d.ts"/>
import Runner from "../src/runner";
import File from "../src/file";
import * as Formatters from "../src/formatters/";
import * as chai from "chai";
import * as fs from "fs";

let expect = chai.expect;

describe("formatters", () => {
    let tests = [
        {file: "rules/start_at_tab_01", errors: 1},
        {file: "zhello01", errors: 0},
    ];

    tests.forEach((test) => {
        let filename = "./test/abap/" + test.file + ".prog.abap";
        let file = new File(filename, fs.readFileSync(filename, "utf8"));
        Runner.run([file]);

        it("Json " + test.file, () => {
            expect(file.get_count()).to.equals(test.errors);
            expect(Formatters.Json.output([file]).split("\n").length).to.equals(test.errors * 16 + 1);
        });

        it("Standard " + test.file, () => {
            expect(file.get_count()).to.equals(test.errors);
            expect(Formatters.Standard.output([file]).split("\n").length).to.equals(test.errors + 2);
        });

        it("Summary " + test.file, () => {
            expect(file.get_count()).to.equals(test.errors);
            expect(Formatters.Summary.output([file]).split("\n").length).to.equals(test.errors + 1);
        });

    });
});