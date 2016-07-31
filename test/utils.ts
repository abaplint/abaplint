import "../typings/index.d.ts";
import File from "../src/file";
import Runner from "../src/runner";
import * as chai from "chai";

// utils for testing

let expect = chai.expect;

export function statementType(tests, description: string, type) {
  describe(description + " statement type", () => {
    tests.forEach((test) => {
      let file = new File("temp.abap", test);
      Runner.run([file]);
      let slist = file.getStatements();

      it("\"" + test + "\" should be " + description, () => {
        let compare = slist[0] instanceof type;
        expect(compare).to.equals(true);
// assumption no colons in input
        expect(slist[0].getTokens().length).to.equal(file.getTokens().length);
      });
    });
  });
}