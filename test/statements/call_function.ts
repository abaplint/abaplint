import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("CALL FUNCTION statement type", () => {
  let tests = [
    "CALL FUNCTION 'DDIF_TTYP_GET'.",
    "CALL FUNCTION 'DDIF_TTYP_GET' EXPORTING name = lv_name.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be CALL FUNCTION", () => {
      let compare = slist[0] instanceof Statements.CallFunction;
      expect(compare).to.equals(true);
    });
  });
});
