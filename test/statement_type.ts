/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />

import File from "../src/file";
import * as chai from "chai";
import * as Statements from "../src/statements/statements";

let expect = chai.expect;

describe("statement_type", function() {
    let tests = [
        {code: "REPORT zfoo.", type: Statements.Report, name: "Report"},
        {code: "WRITE 'Hello'.", type: Statements.Write, name: "Write"},
    ];

    tests.forEach(function(test) {
        it("\"" + test.code + "\" should be " + test.name, () => {
            let file = new File("temp.abap", test.code);
            let compare = file.get_statements()[0] instanceof test.type;
            expect(compare).to.equals(true);
        });
    });
});
