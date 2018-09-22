import Runner from "../src/runner";
import {File} from "../src/file";
import {Formatter} from "../src/formatters";
import * as chai from "chai";

let expect = chai.expect;

describe("formatters", () => {
  let tests = [
    {abap: "foo bar", errors: 1},
    {abap: "WRITE 'Hello'.", errors: 0},
  ];

  tests.forEach((test) => {
    let issues = new Runner([new File("cl_foo.clas.abap", test.abap)]).findIssues();

    it("Json " + test.abap, () => {
      expect(issues.length).to.equals(test.errors);
      expect(Formatter.format(issues, "json").split("\n").length).to.equals(2);
    });

    it("Standard " + test.abap, () => {
      expect(issues.length).to.equals(test.errors);
      expect(Formatter.format(issues).split("\n").length).to.equals(test.errors + 2);
    });

    it("Total " + test.abap, () => {
      expect(issues.length).to.equals(test.errors);
      expect(Formatter.format(issues, "total").split("\n").length).to.equals(2);
    });

  });
});