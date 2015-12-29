/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />

import Runner from "../src/runner";
import * as chai from "chai";

let expect = chai.expect;

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