import {MemoryFile} from "../src";
import {Lexer} from "../src/abap/1_lexer/lexer";
import * as fs from "fs";

console.log("========================");
const file = new MemoryFile("abapgit.abap", fs.readFileSync("./lexer_performance.abap", "utf-8"));

let total = 0;
for (let i = 0; i < 10; i++) {
  const before = Date.now();
  const result = new Lexer().run(file);
  const runtime = Date.now() - before;
  console.log("Runtime: " + runtime + "ms");
  total += runtime;
  console.log("Tokens: " + result.tokens.length);
}
console.log("Total: " + total);