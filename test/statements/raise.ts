import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("RAISE statement type", () => {
  let tests = [
    "raise exception type zcx_root.",
    "RAISE EXCEPTION TYPE lcx_exception EXPORTING iv_text = lv_text.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be RAISE", () => {
      let compare = slist[0] instanceof Statements.Raise;
      expect(compare).to.equals(true);
    });
  });
});
