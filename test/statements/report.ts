import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("REPORT statement type", () => {
  let tests = [
    "REPORT zabapgit LINE-SIZE 100.",
    "REPORT zabapgit.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be REPORT", () => {
      let compare = slist[0] instanceof Statements.Report;
      expect(compare).to.equals(true);
    });
  });
});
