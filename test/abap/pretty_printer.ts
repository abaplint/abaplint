import {expect} from "chai";
import {PrettyPrinter} from "../../src/abap/pretty_printer";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";

describe("Pretty printer, keywords upper case", () => {
  const tests = [
    {input: "REPORT zfoo.", expected: "REPORT zfoo."},
    {input: "report zfoo.", expected: "REPORT zfoo."},
    {input: "write report.", expected: "WRITE report."},
    {input: "data(foo) = 2.", expected: "DATA(foo) = 2."},
    {input: "WRITE foo.\nwrite bar.", expected: "WRITE foo.\nWRITE bar."},
  ];

  tests.forEach((test) => {
    it(test.input, () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
      expect(reg.getABAPFiles().length).to.equal(1);
      const result = new PrettyPrinter(reg.getABAPFiles()[0]).run();
      expect(result).to.equals(test.expected);
    });
  });
});

describe("Pretty printer, expected indentation", () => {
  const tests = [
    {input: "parser error.", expected: [1]},
    {input: "REPORT zfoo.", expected: [1]},
    {input: "REPORT zfoo.\nWRITE moo.", expected: [1, 1]},
    {input: "IF foo = bar.\nWRITE moo.\nENDIF.", expected: [1, 3, 1]},
  ];

  tests.forEach((test) => {
    it(test.input, () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
      expect(reg.getABAPFiles().length).to.equal(1);
      const result = new PrettyPrinter(reg.getABAPFiles()[0]).getExpectedIndentation();
      expect(result).to.deep.equal(test.expected);
    });
  });
});