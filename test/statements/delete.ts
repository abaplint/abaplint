import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("DELETE statement type", () => {
  let tests = [
    "DELETE mt_stack INDEX lv_index.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be DELETE", () => {
      let compare = slist[0] instanceof Statements.Delete;
      expect(compare).to.equals(true);
    });
  });
});
