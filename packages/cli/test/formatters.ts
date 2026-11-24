import {expect} from "chai";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {Issue, MemoryFile, Position, Severity} from "@abaplint/core";
import {xml2js} from "xml-js";
import {Formatter} from "../src/formatters/_format";

const message = `Reduce template, remove "&&", a < b, write &lt;p&gt; <a> <b>`;

describe("XML formatters", () => {
  let dir = "";
  let filename = "";

  before(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "abaplint-"));
    filename = path.join(dir, "zfoo&bar.prog.abap");
    fs.writeFileSync(filename, "WRITE |foo| && |bar|.\n");
  });

  after(() => {
    fs.rmSync(dir, {recursive: true});
  });

  function format(name: string): any {
    const file = new MemoryFile(filename, fs.readFileSync(filename, "utf8"));
    const issue = Issue.atPosition(file, new Position(1, 7), message, "reduce_string_templates", Severity.Error);
    return xml2js(Formatter.format([issue], name, 1), {compact: true});
  }

  it("junit, special characters", () => {
    const testcase = format("junit").testsuites.testsuite.testcase;
    expect(testcase.failure._attributes.message).to.equal(message);
    expect(testcase._attributes.file).to.equal(filename);
    expect(testcase._attributes.name).to.equal(filename + ": [1, 7] - reduce_string_templates");
    expect(testcase.failure._cdata).to.contain("WRITE |foo| && |bar|.");
  });

  it("checkstyle, special characters", () => {
    const file = format("checkstyle").checkstyle.file;
    expect(file._attributes.name).to.equal(filename);
    expect(file.error._attributes.message).to.equal(message);
  });

});
