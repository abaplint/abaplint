/// <reference path="typings/node/node.d.ts" />
/// <reference path="typings/glob/glob.d.ts" />
/// <reference path="typings/minimist/minimist.d.ts" />

import Report from "./src/report";
import Runner from "./src/runner";
import * as fs from "fs";

import * as glob from "glob";
import * as minimist from "minimist";

let report = new Report();

function process_file(filename: string) {
    new Runner(filename, report);
}

let argv = minimist(process.argv.slice(2));
let format = "default";

if (argv["f"] !== undefined || argv["format"] !== undefined) {
    if (argv["f"] !== undefined) {
        format = argv["f"];
    } else {
        format = argv["format"];
    }
}

if (argv["h"] !== undefined || argv["help"] !== undefined) {
    console.log("Usage: aoc [options] [file ...]");
    console.log("");
    console.log("Options:");
    console.log("  -h, --help       display this help");
    console.log("  -f, --format     output format (default, total)");
    console.log("  -v, --version    current version");
} else if (argv["v"] !== undefined || argv["version"] !== undefined) {
    let raw = fs.readFileSync(__dirname + "/package.json", "utf8");
    let pjson = JSON.parse(raw);
    console.log(pjson.version);
} else if (argv._[0] === undefined) {
    console.log("Supply filename");
} else {
    for (const file of argv._) {
        glob.sync(file).forEach(process_file);
    }
    let output = "";
    if (format === "total") {
        output = report.output_total();
    } else {
        output = report.output_errors() + report.output_total();
    }
    process.stdout.write(output, () => {
        if (report.get_count() > 0) {
            process.exit(1);
        }
    });
}