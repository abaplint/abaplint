import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("SORT statement type", () => {
  let tests = [
    "SORT mt_items BY txt ASCENDING AS TEXT.",
    "SORT rs_component-ctlr_metadata BY def-sdf ASCENDING.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be SORT", () => {
      let compare = slist[0] instanceof Statements.Sort;
      expect(compare).to.equals(true);
    });
  });
});
