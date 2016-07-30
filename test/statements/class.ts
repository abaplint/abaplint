import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("CLASS statement type", () => {
  let tests = [
    "CLASS foobar IMPLEMENTATION.",
    "CLASS lcl_object_tabl DEFINITION INHERITING FROM lcl_objects_super FINAL.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be CLASS", () => {
      let compare = slist[0] instanceof Statements.Class;
      expect(compare).to.equals(true);
    });
  });
});
