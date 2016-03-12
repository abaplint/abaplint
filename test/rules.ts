/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />

import Runner from "../src/runner";
import File from "../src/file";
import * as Formatters from "../src/formatters/";
import * as chai from "chai";
import * as fs from "fs";

let expect = chai.expect;

describe("errors", () => {
    let tests = [
        {file: "start_at_tab_01",        errors: 1},
        {file: "functional_writing_01",  errors: 1},
        {file: "functional_writing_02",  errors: 1},
        {file: "functional_writing_03",  errors: 0},
        {file: "functional_writing_04",  errors: 0},
        {file: "line_only_punc_01",      errors: 1},
        {file: "line_only_punc_02",      errors: 1},
        {file: "max_one_statement_01",   errors: 1},
        {file: "line_length_01",         errors: 1},
        {file: "exit_or_check_01",       errors: 0},
        {file: "exit_or_check_02",       errors: 1},
        {file: "space_before_colon_01",  errors: 1},
        {file: "contains_tab_01",        errors: 1},
        {file: "contains_tab_02",        errors: 1},
        {file: "parser_error_01",        errors: 1},
        {file: "colon_missing_space_01", errors: 1},
        {file: "7bit_ascii_01",          errors: 1},
        {file: "obsolete_statement_01",  errors: 6},
        {file: "whitespace_end_01",      errors: 1},
        {file: "exporting_01",           errors: 1},
        {file: "empty_01",               errors: 2},
        {file: "sequential_blank_01",    errors: 1},
        {file: "definitions_top_01",     errors: 1},
        {file: "definitions_top_02",     errors: 0},
    ];

    tests.forEach((test) => {
        it(test.file + " should have " + test.errors + " error(s)", () => {
            let filename = "./test/abap/rules/" + test.file + ".prog.abap";
            let file = new File(filename, fs.readFileSync(filename, "utf8"));
            Runner.run([file]);
            expect(file.get_count()).to.equals(test.errors);

            expect(Formatters.Standard.output([file]).split("\n").length).to.equals(test.errors + 2);
        });
    });
});