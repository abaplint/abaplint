/// <reference path="typings/node/node.d.ts" />

import Lexer from "./src/lexer";
import Parser from "./src/parser";
import Report from "./src/report";
import Runner from "./src/runner";

let glob = require("glob");

let report = new Report();

function process_file(filename: string) {
    let runner = new Runner(filename, report);
}

let argv = require("minimist")(process.argv.slice(2));

if (argv.h != null || argv.helpl != null) {
    console.log("Usage: aoc [options] [file ...]");
    console.log("");
    console.log("Options:");
    console.log("  -h, --help       display this help");
//    console.log("  -f, --format     output format (default, json)");
    console.log("  -v, --version    current version");
} else if (argv.v != null || argv.version != null) {
    let pjson = require("./package.json");
    console.log(pjson.version);
} else if (argv._[0] === undefined) {
    console.log("Supply filename");
} else {
    for (const file of argv._) {
        glob.sync(file).forEach(process_file);
    }
    report.output();
    if (report.get_count() > 0) {
        process.exit(1);
    }
}