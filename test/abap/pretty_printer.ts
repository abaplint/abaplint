import {expect} from "chai";
import {PrettyPrinter} from "../../src/abap/pretty_printer";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";

const testTitle = (text: string): string => { return text.split("\n")[0]; };

describe("Pretty printer, keywords upper case", () => {
  const tests = [
    {input: "REPORT zfoo.", expected: "REPORT zfoo."},
    {input: "report zfoo.", expected: "REPORT zfoo."},
    {input: "write report.", expected: "WRITE report."},
    {input: "data(foo) = 2.", expected: "DATA(foo) = 2."},
    {input: "WRITE foo.\nwrite bar.", expected: "WRITE foo.\nWRITE bar."},
  ];

  tests.forEach((test) => {
    it(testTitle(test.input), () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
      expect(reg.getABAPFiles().length).to.equal(1);
      const result = new PrettyPrinter(reg.getABAPFiles()[0]).run();
      expect(result).to.equals(test.expected);
    });
  });
});

describe("Pretty printer, indent code", () => {
  const tests = [
    {input: "parser error.", expected: "parser error."},
    {input: "REPORT zfoo.", expected: "REPORT zfoo."},
    {input: "REPORT zfoo.\nWRITE moo.", expected: "REPORT zfoo.\nWRITE moo."},
    {input: "IF foo = bar.\nWRITE moo.\nENDIF.", expected: "IF foo = bar.\n  WRITE moo.\nENDIF."},
  ];

  tests.forEach((test) => {
    it(testTitle(test.input), () => {
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
    it(testTitle(test.input), () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
      expect(reg.getABAPFiles().length).to.equal(1);
      const result = new PrettyPrinter(reg.getABAPFiles()[0]).getExpectedIndentation();
      expect(result).to.deep.equal(test.expected);
    });
  });
});

describe("Pretty printer with alignTryCatch", () => {
  const tests = [
    {
      input: "try. \"no align\nwrite moo.\ncatch cx_root.\nwrite err.\nendtry.",
      expected: [1, -1, 5, 3, 5, 1],
    },
    {
      input: "try. \"with align\nwrite moo.\ncatch cx_root.\nwrite err.\nendtry.",
      expected: [1, -1, 3, 1, 3, 1],
      options: {alignTryCatch: true}},
  ];

  tests.forEach((test) => {
    it(testTitle(test.input), () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
      expect(reg.getABAPFiles().length).to.equal(1);
      const result = new PrettyPrinter(reg.getABAPFiles()[0], test.options).getExpectedIndentation();
      expect(result).to.deep.equal(test.expected);
    });
  });
});

describe("Pretty printer with globalClassSkipFirst", () => {
  const tests = [
    {
      input: "class zcl_no_skip definition public.\npublic section.\nendclass.",
      expected: [1, 3, 1],
    },
    {
      input: "class zcl_skip definition public.\npublic section.\nendclass.\nwrite lo_var.",
      expected: [1, 1, 1, 1],
      options: {globalClassSkipFirst: true},
    },
    {
      input: "class lcl_skip definition.\npublic section.\nendclass.\nwrite lo_var.",
      expected: [1, 3, 1, 1],
      options: {globalClassSkipFirst: true},
    },
    {
      input: [
        "class zcl_skip definition public.",
        "public section.",
        "methods xxx.",
        "endclass.",
        "class zcl_skip implementation.",
        "method xxx.",
        "write msg.",
        "endmethod.",
        "endclass.",
        "class zcl_NO_skip implementation.",
        "method yyy.",
        "write msg.",
        "endmethod.",
        "endclass.",
      ].join("\n"),
      expected: [1, 1, 3, 1, 1, 1, 3, 1, 1, 1, 3, 5, 3, 1],
      options: {globalClassSkipFirst: true},
    },
  ];

  tests.forEach((test) => {
    it(testTitle(test.input), () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
      expect(reg.getABAPFiles().length).to.equal(1);
      const result = new PrettyPrinter(reg.getABAPFiles()[0], test.options).getExpectedIndentation();
      expect(result).to.deep.equal(test.expected);
    });
  });
});
