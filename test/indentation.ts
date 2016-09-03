import "../typings/index.d.ts";
import * as chai from "chai";
import { Indentation } from "../src/rules/indentation";
import Runner from "../src/runner";
import File from "../src/file";

let expect = chai.expect;

let tests = [
  {abap: "add 2 to lv_foo.", cnt: 0},
  {abap: "  add 2 to lv_foo.", cnt: 1},
  {abap: "IF foo = bar.\nmoo = 1.", cnt: 1},
  {abap: "IF foo = bar.\n  moo = 1.", cnt: 0},
  {abap: "METHOD bar.\n  moo = 1.", cnt: 0},
];

describe("test indentation rule", () => {
  tests.forEach((test) => {
    let file = new File("temp.abap", test.abap);
    Runner.run([file]);

    let issues = file.getIssues().filter((i) => { return i.getRule() instanceof Indentation; });
    it("\"" + test.abap + "\" should have " + test.cnt + " issue(s)", () => {
      expect(issues.length).to.equals(test.cnt);
    });
  });
});