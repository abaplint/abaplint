import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("ADD statement type", () => {
  let tests = [
    "add 2 to lv_foo.",
    "add zcl_class=>c_diagonal to lo_foo->mode.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be ADD", () => {
      let compare = slist[0] instanceof Statements.Add;
      expect(compare).to.equals(true);
    });
  });
});
