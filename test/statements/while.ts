import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("WHILE statement type", () => {
  let tests = [
    "WHILE strlen( rv_bits ) < iv_length.",
    "WHILE NOT lv_hex IS INITIAL.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be WHILE", () => {
      let compare = slist[0] instanceof Statements.While;
      expect(compare).to.equals(true);
    });
  });
});
