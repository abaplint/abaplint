import {ABAPObject, MemoryFile, Registry, SyntaxLogic} from "../src";
import * as fs from "fs";

console.log("========================");
const file1 = new MemoryFile("abapgit.prog.abap", fs.readFileSync("./lexer_performance.abap", "utf-8"));
// TODO, it needs the deps to give a correct result TODO
const reg = new Registry().addFile(file1).parse();

console.log("run syntax logc,");
const before = Date.now();
const res = new SyntaxLogic(reg, reg.getFirstObject() as ABAPObject).run();
console.dir(res.issues);
const runtime = Date.now() - before;
console.log("Total: " + runtime + "ms");
