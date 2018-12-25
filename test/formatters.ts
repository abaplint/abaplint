import {expect} from "chai";
import {Formatter} from "../src/formatters/_format";
import {findIssues} from "./abap/_utils";

describe("formatters", () => {
  const tests = [
    {abap: "foo bar", errors: 1},
    {abap: "IF foo = bar.", errors: 1},
    {abap: "WRITE 'Hello'.", errors: 0},
  ];

  tests.forEach((test) => {
    const issues = findIssues(test.abap);

    it(test.abap, () => {
      expect(issues.length).to.equals(test.errors);
      expect(Formatter.format(issues, "json", 1).split("\n").length).to.equals(2);

      expect(issues.length).to.equals(test.errors);
      expect(Formatter.format(issues, "standard", 1).split("\n").length).to.equals(test.errors + 2);

      expect(issues.length).to.equals(test.errors);
      expect(Formatter.format(issues, "total", 1).split("\n").length).to.equals(2);
    });

  });
});