import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("DESCRIBE statement type", () => {
  let tests = [
    "describe table lt_foo lines lv_lines.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be DESCRIBE", () => {
      let compare = slist[0] instanceof Statements.Describe;
      expect(compare).to.equals(true);
    });
  });
});
