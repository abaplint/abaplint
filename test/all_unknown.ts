/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />

import * as chai from "chai";
import * as fs from "fs";
import * as Statements from "../src/statements/";
import File from "../src/file";

let expect = chai.expect;

describe("all_unknown", () => {
    let filename = "zall_unknown";
    it(filename + " should only have Unknown statements", () => {
        let code = fs.readFileSync("./test/abap/" + filename + ".prog.abap", "utf8");
        let file = new File(filename, code);
        for (let statement of file.get_statements()) {
            expect(statement instanceof Statements.Unknown).to.equals(true);
        }
    });
});