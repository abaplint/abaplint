import {SequentialBlank} from "../../src/rules/sequential_blank";
import {testRule, testRuleFix} from "./_utils";
import {expect} from "chai";

const tests = [
  {abap: "\n\n\n\n", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "REPORT zfoo.\n\n\n\nWRITE 1.", cnt: 0},
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


const fixTests = [
  {input: "REPORT zfoo.\n\n\n\n", output: "REPORT zfoo.\n\n\n"},
  {input: "REPORT zfoo.\n\n\n\n\t\t\t", output: "REPORT zfoo.\n\n\n"},
  //3 blank lines + the carriage return on the line of the first statement
  {input: "REPORT zfoo.\n\n\n\n\nWRITE 1.", output: "REPORT zfoo.\n\n\n\nWRITE 1."},
  {input: "REPORT zfoo.\n\n\n\n\n\t\t\t\nWRITE 1.", output: "REPORT zfoo.\n\n\n\nWRITE 1."},
];

testRuleFix(fixTests, SequentialBlank);