/// <reference path="typings/node/node.d.ts" />

import Lexer from "./src/lexer";
import Parser from "./src/parser";
import Report from "./src/report";
import Check01 from "./src/check01";

let fs = require("fs");

let argv = require("minimist")(process.argv.slice(2));
let filename = argv._[0];
if (filename === undefined) {
    console.log("Supply filename");
} else {
    console.log("File: " + filename);

    let buf = fs.readFileSync(__dirname + "/test/abap/" + filename + ".prog.abap", "utf8");

    let lexer = new Lexer(buf);
    lexer.run();

    let parser = new Parser(lexer);
    parser.run();

    let report = new Report();
    let check01 = new Check01(report);
    check01.run(parser.get_statements());

    if (report.get_count() > 0) {
        console.error("abap-open-checks errors: " + report.get_count());
    } else {
        console.error("abap-open-checks no errors");
    }
}