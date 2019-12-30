import {expect} from "chai";
import {PrettyPrinter} from "../../src/pretty_printer/pretty_printer";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Indent} from "../../src/pretty_printer/indent";
import {KeywordCaseConf, KeywordCaseStyle} from "../../src/rules";

const testTitle = (text: string): string => {return text.split("\n")[0]; };

describe("Pretty printer, keywords upper case", () => {
  const tests = [
    {input: "REPORT zfoo.", expected: "REPORT zfoo."},
    {input: "report zfoo.", expected: "REPORT zfoo."},
    {input: "write report.", expected: "WRITE report."},
    {input: "data(foo) = 2.", expected: "DATA(foo) = 2."},
    {input: "WRITE foo.\nwrite bar.", expected: "WRITE foo.\nWRITE bar."},
    {input: "CALL FUNCTION 'FOOBAR' EXCEPTIONS OTHERS = 1.",
      expected: "CALL FUNCTION 'FOOBAR' EXCEPTIONS OTHERS = 1."},
  ];

  tests.forEach((test) => {
    it(testTitle(test.input), () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
      expect(reg.getABAPFiles().length).to.equal(1);
      const config = reg.getConfig();
      const result = new PrettyPrinter(reg.getABAPFiles()[0], config).run();
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
      const config = reg.getConfig();
      const result = new PrettyPrinter(reg.getABAPFiles()[0], config).run();
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
      const file = reg.getABAPFiles()[0];
      const result = new Indent().getExpectedIndents(file);
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
      options: {alignTryCatch: true},
    },
  ];

  tests.forEach((test) => {
    it(testTitle(test.input), () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
      expect(reg.getABAPFiles().length).to.equal(1);
      const file = reg.getABAPFiles()[0];
      const result = new Indent(test.options).getExpectedIndents(file);
      expect(result).to.deep.equal(test.expected);
    });
  });
});


describe("Remove sequential blanks", () => {
  const tests = [
    {
      input: "REPORT zfoo.\nWRITE: `foo`.",
      expected: "REPORT zfoo.\nWRITE: `foo`.",
    },
    {
      input: "REPORT zfoo.\n\n\n\n\nWRITE: `foo`.",
      expected: "REPORT zfoo.\n\n\n\nWRITE: `foo`.",
    },
    {
      input: "REPORT zfoo.\n\n\n\n\nWRITE: `foo`.\n\n\n\n\nWRITE: 'bar'",
      expected: "REPORT zfoo.\n\n\n\nWRITE: `foo`.\n\n\n\nWRITE: 'bar'",
    },
    {
      input: "REPORT zfoo.\n\t\n\n\n\nWRITE: `foo`.\n\n\t\n\n\nWRITE: 'bar'",
      expected: "REPORT zfoo.\n\t\n\n\nWRITE: `foo`.\n\n\t\n\nWRITE: 'bar'",
    },
    {
      input: "REPORT zfoo.\n\t\n\n\n\nWRITE: `foo`.\n\n\t\n\n\nWRITE: 'bar'    \n\n\n\n\n\n",
      expected: "REPORT zfoo.\n\t\n\n\nWRITE: `foo`.\n\n\t\n\nWRITE: 'bar'",
    },
  ];

  tests.forEach((test) => {
    it(testTitle(test.input), () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
      expect(reg.getABAPFiles().length).to.equal(1);
      const config = reg.getConfig();
      const prettyPrinter = new PrettyPrinter(reg.getABAPFiles()[0], config);
      const result = prettyPrinter.run();
      expect(result).to.equal(test.expected);
    });
  });
});

describe("Fix keyword case", () => {
  const lowerCaseConfig = new KeywordCaseConf();
  lowerCaseConfig.style = KeywordCaseStyle.Lower;

  const upperCaseConfig = new KeywordCaseConf();
  upperCaseConfig.style = KeywordCaseStyle.Upper;

  const tests = [
    {
      input: "REPORT zfoo.WRITE: `foo`.",
      expected: "report zfoo.write: `foo`.",
      config: lowerCaseConfig,
    },
    {
      input: "report zfoo.write: `foo`.",
      expected: "REPORT zfoo.WRITE: `foo`.",
      config: upperCaseConfig,
    },
    // always lowercase non-keywords
    {
      input: "REPORT ZBAR.DATA(X) = `foo`.",
      expected: "report zbar.data(x) = `foo`.",
      config: lowerCaseConfig,
    },
    {
      input: "report ZFOO.data(X) = `foo`.",
      expected: "REPORT zfoo.DATA(x) = `foo`.",
      config: upperCaseConfig,
    },
    {
      input: "WRITE: `FOO` ##NO_TEXT.",
      expected: "write: `FOO` ##NO_TEXT.",
      config: lowerCaseConfig,
    },
    {
      input: "WRITE: 'FOO' ##NO_TEXT.",
      expected: "write: 'FOO' ##NO_TEXT.",
      config: lowerCaseConfig,
    },
    {
      input: "WRITE: |FOO| ##NO_TEXT.",
      expected: "write: |FOO| ##NO_TEXT.",
      config: lowerCaseConfig,
    },
  ];

  tests.forEach((test) => {
    it(testTitle(test.input), () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
      expect(reg.getABAPFiles().length).to.equal(1);
      const config = reg.getConfig() as any;
      config.config.rules.keyword_case = test.config;
      const prettyPrinter = new PrettyPrinter(reg.getABAPFiles()[0], config);
      const result = prettyPrinter.run();
      expect(result).to.equal(test.expected);
    });
  });
});


describe("Remove sequential blanks, no config", () => {
  const tests = [
    {
      input: "REPORT zfoo.\n\n\n\n\nWRITE: `foo`.",
      expected: "REPORT zfoo.\n\n\n\n\nWRITE: `foo`.",
    },
  ];

  tests.forEach((test) => {
    it(testTitle(test.input), () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
      expect(reg.getABAPFiles().length).to.equal(1);
      const config = reg.getConfig() as any;
      delete config.config.rules.sequential_blank;

      const prettyPrinter = new PrettyPrinter(reg.getABAPFiles()[0], config);
      const result = prettyPrinter.run();
      expect(result).to.equal(test.expected);
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
      const file = reg.getABAPFiles()[0];
      expect(reg.getABAPFiles().length).to.equal(1);
      const result = new Indent(test.options).getExpectedIndents(file);
      expect(result).to.deep.equal(test.expected);
    });
  });
});
