import {Formatter} from "../src/formatters/_format";
import {expect} from "chai";
import {findIssues} from "./_utils";

describe("formatters", () => {
  let tests = [
    {abap: "foo bar", errors: 1},
    {abap: "IF foo = bar.", errors: 1},
    {abap: "WRITE 'Hello'.", errors: 0},
  ];

  tests.forEach((test) => {
    let issues = findIssues(test.abap);

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