import Runner from "../src/runner";
import {File} from "../src/file";
import * as chai from "chai";

let expect = chai.expect;

describe("formatters", () => {
  let tests = [
    {abap: "foo bar", errors: 1},
    {abap: "WRITE 'Hello'.", errors: 0},
  ];

  tests.forEach((test) => {
    let issues = Runner.run([new File("temp.abap", test.abap)]);

    it("Json " + test.abap, () => {
      expect(issues.length).to.equals(test.errors);
      expect(Runner.format(issues, "json").split("\n").length).to.equals(2);
    });

    it("Standard " + test.abap, () => {
      expect(issues.length).to.equals(test.errors);
      expect(Runner.format(issues).split("\n").length).to.equals(test.errors + 2);
    });

    it("Total " + test.abap, () => {
      expect(issues.length).to.equals(test.errors);
      expect(Runner.format(issues, "total").split("\n").length).to.equals(2);
    });

  });
});