/// <reference path="typings/node/node.d.ts" />
/// <reference path="typings/glob/glob.d.ts" />
/// <reference path="typings/minimist/minimist.d.ts" />

import Report from "./src/report";
import Runner from "./src/runner";
import File from "./src/file";
import * as fs from "fs";

import * as glob from "glob";
import * as minimist from "minimist";

let report = new Report();
let argv = minimist(process.argv.slice(2));
let format = "default";
let output = "";

function process_file(filename: string) {
    let file = new File(filename, fs.readFileSync(filename, "utf8"));
    new Runner(file, report);
}

if (argv["f"] !== undefined || argv["format"] !== undefined) {
    if (argv["f"] !== undefined) {
        format = argv["f"];
    } else {
        format = argv["format"];
    }
}

if (argv["h"] !== undefined || argv["help"] !== undefined) {
    output = output + "Usage: aoc [options] [file ...]\n";
    output = output + "\n";
    output = output + "Options:\n";
    output = output + "  -h, --help       display this help\n";
    output = output + "  -f, --format     output format (default, total)\n";
    output = output + "  -v, --version    current version\n";
} else if (argv["v"] !== undefined || argv["version"] !== undefined) {
    let raw = fs.readFileSync(__dirname + "/package.json", "utf8");
    let pjson = JSON.parse(raw);
    output = output + pjson.version + "\n";
} else if (argv._[0] === undefined) {
    output = output + "Supply filename\n";
} else {
    for (const file of argv._) {
        glob.sync(file).forEach(process_file);
    }
    if (format === "total") {
        output = report.output_total();
    } else {
        output = report.output_errors() + report.output_total();
    }
}

process.stdout.write(output, () => {
    if (report.get_count() > 0) {
        process.exit(1);
    }
});