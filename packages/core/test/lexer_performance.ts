import {MemoryFile} from "../src";
import {Lexer} from "../src/abap/1_lexer/lexer";
import * as fs from "fs";

console.log("========================");
const file = new MemoryFile("abapgit.abap", fs.readFileSync("./lexer_performance.abap", "utf-8"));

const before = Date.now();
const result = Lexer.run(file);
const runtime = Date.now() - before;
console.log("Tokens: " + result.tokens.length);
console.log("Runtime: " + runtime + "ms");