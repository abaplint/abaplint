import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("ASSERT statement type", () => {
  let tests = [
    "ASSERT <lv_field> IS ASSIGNED.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be ASSERT", () => {
      let compare = slist[0] instanceof Statements.Assert;
      expect(compare).to.equals(true);
    });
  });
});
