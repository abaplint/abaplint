import "../typings/index.d.ts";
import Runner from "../src/runner";
import {File} from "../src/file";
import * as chai from "chai";
import * as fs from "fs";

let expect = chai.expect;

describe("formatters", () => {
  let tests = [
    {file: "rules/7bit_ascii_01", errors: 1},
    {file: "zhello01", errors: 0},
  ];

  tests.forEach((test) => {
    let filename = "./test/abap/" + test.file + ".prog.abap";
    let issues = Runner.run([new File(filename, fs.readFileSync(filename, "utf8"))]);

    it("Json " + test.file, () => {
      expect(issues.length).to.equals(test.errors);
      expect(Runner.format(issues, "json").split("\n").length).to.equals(2);
    });

    it("Standard " + test.file, () => {
      expect(issues.length).to.equals(test.errors);
      expect(Runner.format(issues).split("\n").length).to.equals(test.errors + 2);
    });

    it("Total " + test.file, () => {
      expect(issues.length).to.equals(test.errors);
      expect(Runner.format(issues, "total").split("\n").length).to.equals(2);
    });

  });
});