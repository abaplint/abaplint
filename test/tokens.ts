/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import Lexer from "../src/lexer";
import Token from "../src/token";
import chai = require("chai");

let expect = chai.expect;
let fs = require("fs");

function helper(file: string): Lexer {
    let buf = fs.readFileSync(__dirname + "/abap/" + file, "utf8");
    let lexer = new Lexer(buf);
    lexer.run();
    return lexer;
}

describe("tokens", () => {
    let tests = [
                [ "zhello01" , 7 ],
                [ "zhello02" , 7 ],
                [ "zhello03" , 7 ],
                [ "zhello04" , 7 ],
                [ "zhello05" , 7 ],
                [ "zhello06" , 7 ]
                ];
    let test: any;

    for (let arr of tests) {
        test = arr;
        describe(test[0] + ".prog.abap", () => {
            it("should be " + test[1], () => {
                let tokens = helper(test[0] + ".prog.abap").get_tokens();
                expect(tokens.length).to.equals(test[1]);
            });
        });
    }

});