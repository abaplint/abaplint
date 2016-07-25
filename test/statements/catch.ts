import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("CATCH statement type", () => {
  let tests = [
    "catch cx_foo.",
    "CATCH cx_pak_invalid_data cx_pak_invalid_state.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be CATCH", () => {
      let compare = slist[0] instanceof Statements.Catch;
      expect(compare).to.equals(true);
    });
  });
});
