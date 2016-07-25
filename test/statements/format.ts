import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("FORMAT statement type", () => {
  let tests = [
    "FORMAT COLOR COL_GROUP.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be FORMAT", () => {
      let compare = slist[0] instanceof Statements.Format;
      expect(compare).to.equals(true);
    });
  });
});
