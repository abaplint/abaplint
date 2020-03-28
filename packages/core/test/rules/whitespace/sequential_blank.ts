import {SequentialBlank} from "../../../src/rules/whitespace/sequential_blank";
import {testRule} from "../_utils";
import {expect} from "chai";

const tests = [
  {abap: "\n\n\n\n", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
];

const blankTests = [
  {abap: "", expected: true},
  {abap: "\t", expected: true},
  {abap: "\n", expected: true},
  {abap: "       ", expected: true},
  {abap: "WRITE:\t\t / 'abc'.\n", expected: false},
];

describe("blank line matching", () => {
  for (const test of blankTests) {
    it(test.abap, () => {
      const result = SequentialBlank.isBlankOrWhitespace(test.abap);
      expect(result).to.equal(test.expected);
    });
  }
});

testRule(tests, SequentialBlank);