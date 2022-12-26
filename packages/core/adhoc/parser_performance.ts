import {MemoryFile, Version} from "../src";
import {Lexer} from "../src/abap/1_lexer/lexer";
import * as fs from "fs";
import {StatementParser} from "../src/abap/2_statements/statement_parser";

console.log("========================");
const file = new MemoryFile("abapgit.abap", fs.readFileSync("./lexer_performance.abap", "utf-8"));

const lexerResult = new Lexer().run(file);

let total = 0;
for (let i = 0; i < 4; i++) {
  const before = Date.now();
  new StatementParser(Version.v702).run([lexerResult], []);
  const runtime = Date.now() - before;
  total += runtime;
}
console.log("Total: " + total + "ms");
