import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("FIELD-SYMBOL statement type", () => {
  let tests = [
    "field-symbol <foo> type c.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be FIELD-SYMBOL", () => {
      let compare = slist[0] instanceof Statements.FieldSymbol;
      expect(compare).to.equals(true);
    });
  });
});
