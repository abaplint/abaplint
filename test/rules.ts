import "../typings/index.d.ts";
import Runner from "../src/runner";
import {File} from "../src/file";
import * as chai from "chai";
import * as fs from "fs";

let expect = chai.expect;

describe("rules", () => {
  let checks = [
    { check: "exit_or_check",
      tests: [ { file: "01", errors: 0},
        { file: "02", errors: 1},
        { file: "03", errors: 0}],
    },
    { check: "exporting",
      tests: [ { file: "01", errors: 1} ],
    },
    { check: "functional_writing",
      tests: [ { file: "01", errors: 1},
        { file: "02", errors: 1},
        { file: "03", errors: 0},
        { file: "04", errors: 0} ],
    },
    { check: "obsolete_statement",
      tests: [ { file: "01", errors: 6} ],
    },
    { check: "sequential_blank",
      tests: [ { file: "01", errors: 1} ],
    },
    { check: "start_at_tab",
      tests: [ { file: "01", errors: 1},
        { file: "02", errors: 1},
        { file: "03", errors: 2} ],
    },
    { check: "space_before_colon",
      tests: [ { file: "01", errors: 1} ],
    },
    { check: "line_only_punc",
      tests: [ { file: "01", errors: 1},
        { file: "02", errors: 1},
        { file: "04", errors: 1} ],
    },
    { check: "line_length",
      tests: [ { file: "01", errors: 1} ],
    },
    { check: "max_one_statement",
      tests: [ { file: "01", errors: 1} ],
    },
    { check: "parser_error",
      tests: [ { file: "01", errors: 1} ],
    },
    { check: "whitespace_end",
      tests: [ { file: "01", errors: 1} ],
    },
  ];

  checks.forEach((check) => {
    check.tests.forEach((test) => {
      let name = check.check + "_" + test.file;
      it(name + " should have " + test.errors + " error(s)", () => {
        let filename = "./test/abap/rules/" + name + ".prog.abap";
        let issues = Runner.run([new File(filename, fs.readFileSync(filename, "utf8"))]);

        let count = 0;
        for (let issue of issues) {
          issue.getDescription();
          if (issue.getKey() === check.check) {
            count = count + 1;
          }
        }

        expect(count).to.equals(test.errors);
      });
    });
  });
});