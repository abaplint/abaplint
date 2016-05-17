import "../typings/index.d.ts";
import File from "../src/file";
import Runner from "../src/runner";
import * as chai from "chai";
import * as Statements from "../src/statements/";

let expect = chai.expect;

describe("statement_type", () => {
  let tests = [
    {code: "REPORT zfoo.", type: Statements.Report, name: "Report"},
    {code: "WRITE 'Hello'.", type: Statements.Write, name: "Write"},
    {code: "asdf", type: Statements.Unknown, name: "Unknown"},
    {code: "\" 'abc'.FOO", type: Statements.Comment, name: "Comment"},
    {code: "WRITE 'Hello'", type: Statements.Unknown, name: "Unknown"},
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test.code);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test.code + "\" should be 1 statement", () => {
      expect(slist.length).to.equals(1);
    });

    it("\"" + test.code + "\" should be " + test.name, () => {
      let compare = slist[0] instanceof test.type;
      expect(compare).to.equals(true);
    });
  });
});
