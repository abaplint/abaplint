import Runner from "../src/runner";
import {MemoryFile} from "../src/files";
import {Formatter} from "../src/formatters";
import {expect} from "chai";

describe("formatters", () => {
  let tests = [
    {abap: "foo bar", errors: 1},
    {abap: "IF foo = bar.", errors: 1},
    {abap: "WRITE 'Hello'.", errors: 0},
  ];

  tests.forEach((test) => {
    let issues = new Runner([new MemoryFile("any.prog.abap", test.abap)]).findIssues();

    it(test.abap, () => {
      expect(issues.length).to.equals(test.errors);
      expect(Formatter.format(issues, "json").split("\n").length).to.equals(2);

      expect(issues.length).to.equals(test.errors);
      expect(Formatter.format(issues).split("\n").length).to.equals(test.errors + 2);

      expect(issues.length).to.equals(test.errors);
      expect(Formatter.format(issues, "total").split("\n").length).to.equals(2);
    });

  });
});