/// <reference path="typings/node/node.d.ts" />

import Lexer from "./src/lexer";
import Parser from "./src/parser";
import Report from "./src/report";
import Check01 from "./src/check01";
// import * as glob from "glob";

let fs = require("fs");
let glob = require("glob");

function process_file(filename: string) {
    let buf = fs.readFileSync(filename, "utf8");

    let parser = new Parser(new Lexer(buf));

    let report = new Report();
    let check01 = new Check01(report);
    check01.run(parser.get_statements());

    if (report.get_count() > 0) {
        console.error("abap-open-checks\t" + filename + "\t" + report.get_count() + " error");
    } else {
        console.log("abap-open-checks\t" + filename + "\tno errors");
    }
}

let argv = require("minimist")(process.argv.slice(2));
if (argv._[0] === undefined) {
    console.log("Supply filename");
} else {
//    const files = ;
    for (const file of argv._) {
        glob.sync(file).forEach(process_file);
    }
}