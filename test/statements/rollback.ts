import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("ROLLBACK WORK statement type", () => {
  let tests = [
    "ROLLBACK WORK.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be ROLLBACK WORK", () => {
      let compare = slist[0] instanceof Statements.Rollback;
      expect(compare).to.equals(true);
    });
  });
});
