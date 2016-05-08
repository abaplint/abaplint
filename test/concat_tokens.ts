/// <reference path="./typings/mocha/mocha.d.ts"/>
/// <reference path="./typings/chai/chai.d.ts"/>
import File from "../src/file";
import Runner from "../src/runner";
import * as chai from "chai";

let expect = chai.expect;

describe("concat_tokens", () => {
    let tests = [
        "REPORT zfoo.",
        "WRITE 'Hello'.",
    ];

    tests.forEach((test) => {
        it(test, () => {
            let file = new File("temp.abap", test);
            Runner.run([file]);
            let concat = file.get_statements()[0].concat_tokens();
            expect(concat).to.equals(test);
        });
    });
});
