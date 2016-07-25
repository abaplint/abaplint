import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("IMPORT DYNPRO statement type", () => {
  let tests = [
    "IMPORT DYNPRO ls_h lt_f lt_e lt_m ID ls_dynp_id.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be IMPORT DYNPRO", () => {
      let compare = slist[0] instanceof Statements.ImportDynpro;
      expect(compare).to.equals(true);
    });
  });
});
