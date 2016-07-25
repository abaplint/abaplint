import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("IMPORT statement type", () => {
  let tests = [
    "IMPORT foo TO bar FROM MEMORY ID 'MOO'.",
    "IMPORT mv_errty = mv_errty FROM DATA BUFFER p_attributes.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be IMPORT", () => {
      let compare = slist[0] instanceof Statements.Import;
      expect(compare).to.equals(true);
    });
  });
});
