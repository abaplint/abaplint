import "../typings/main.d.ts";
import * as chai from "chai";
import * as fs from "fs";
import * as Statements from "../src/statements/";
import File from "../src/file";
import Runner from "../src/runner";

let expect = chai.expect;

describe("no_unknown", () => {

  let tests = [
    {filename: "zno_unknown"},
    {filename: "zno_unknown_data"},
    {filename: "zno_unknown_append"},
    ];

  tests.forEach((test) => {
    it(test.filename + " should have no Unknown statements", () => {
      let code = fs.readFileSync("./test/abap/" + test.filename + ".prog.abap", "utf8");
      let file = new File(test.filename, code);
      Runner.run([file]);
      for (let statement of file.getStatements()) {
        expect(statement instanceof Statements.Unknown).to.equals(false);
      }
    });
  });
});