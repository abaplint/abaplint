import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("SPLIT statement type", () => {
  let tests = [
    "SPLIT iv_data AT gc_newline INTO TABLE lt_result.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be SPLIT", () => {
      let compare = slist[0] instanceof Statements.Split;
      expect(compare).to.equals(true);
    });
  });
});
