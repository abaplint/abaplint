import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("CALL SELECTION-SCREEN statement type", () => {
  let tests = [
    "CALL SELECTION-SCREEN 1001.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be CALL SELECTION-SCREEN", () => {
      let compare = slist[0] instanceof Statements.CallSelectionScreen;
      expect(compare).to.equals(true);
    });
  });
});
