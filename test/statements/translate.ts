import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("TRANSLATE statement type", () => {
  let tests = [
    "TRANSLATE rv_package USING '/_'.",
    "translate lv_foo to upper case.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be TRANSLATE", () => {
      let compare = slist[0] instanceof Statements.Translate;
      expect(compare).to.equals(true);
    });
  });
});
