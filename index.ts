/// <reference path="typings/node/node.d.ts" />

import Lexer from "./src/lexer";

let fs = require("fs");

export default class Calculator {
    add(x: number, y: number): number {
        return x + y;
    }
}

/*
let argv = require("minimist")(process.argv.slice(2));
console.dir(argv);
console.log(argv._[0]);
*/

let buf = fs.readFileSync(__dirname + "/test/abap/zhello.prog.abap", "utf8");

let lexer: Lexer;
lexer = new Lexer(buf);
lexer.run();
console.dir(lexer.get_statements());