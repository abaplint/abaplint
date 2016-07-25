import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("CLEAR statement type", () => {
  let tests = [
    "CLEAR foobar.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be CLEAR", () => {
      let compare = slist[0] instanceof Statements.Clear;
      expect(compare).to.equals(true);
    });
  });
});
