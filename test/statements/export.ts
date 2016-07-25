import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("EXPORT statement type", () => {
  let tests = [
    "EXPORT foo TO MEMORY ID 'MOO'.",
    "EXPORT mv_errty = mv_errty TO DATA BUFFER p_attributes.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be Export", () => {
      let compare = slist[0] instanceof Statements.Export;
      expect(compare).to.equals(true);
    });
  });
});
