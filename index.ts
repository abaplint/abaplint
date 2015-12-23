/// <reference path="typings/node/node.d.ts" />

import Lexer from "./src/lexer";

export default class Calculator {
    add(x: number, y: number): number {
        return x + y;
    }
}

console.log("hello world");
let argv = require("minimist")(process.argv.slice(2));
console.dir(argv);
console.log(argv._[0]);

let lexer: Lexer;
lexer = new Lexer();
lexer.foo();