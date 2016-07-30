import "../typings/index.d.ts";
import * as chai from "chai";
import * as fs from "fs";
import * as Statements from "../src/statements/";
import File from "../src/file";
import Runner from "../src/runner";

let expect = chai.expect;

describe("unknown statements", () => {

  let tests =  [
    {abap: "data foo bar."},
    {abap: "asdf asdf."},
  ];

  tests.forEach((test) => {
    it("\"" + test.abap + "\" should be unknown", () => {
      let file = new File("foo.abap", test.abap);
      Runner.run([file]);
      for (let statement of file.getStatements()) {
        expect(statement instanceof Statements.Unknown).to.equals(true);
      }
    }
  )});
});