import * as chai from "chai";
import {Unknown} from "../src/abap/statements/statement";
import {File} from "../src/file";
import Runner from "../src/runner";

let expect = chai.expect;

describe("unknown statements", () => {
  let tests =  [
    "data foo bar.",
    "asdf.",
    "asdf",
    "asdf asdf.",
  ];

  tests.forEach((abap) => {
    it("\"" + abap + "\" should be unknown", () => {
      let file = new Runner([new File("cl_foo.clas.abap", abap)]).parse()[0];

      expect(file.getStatements().length).to.equals(1);
      for (let statement of file.getStatements()) {
        expect(statement instanceof Unknown).to.equals(true);
      }
    },
  );
  });
});