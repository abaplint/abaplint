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
  {abap: "WHILE foo = bar.\n  moo = 1.", cnt: 0},
  {abap: "METHOD bar.\n  moo = 1.", cnt: 0},
  {abap: "CLASS bar IMPLEMENTATION.\n  moo = 1.", cnt: 0},
  {abap: "ENDCLASS.", cnt: 0},
  {abap: " ENDCLASS.", cnt: 1},
  {abap: "START-OF-SELECTION.\n  PERFORM run.\nFORM foo.", cnt: 0},
  {abap: "START-OF-SELECTION.\n  PERFORM run.\nCLASS foo IMPLEMENTATION.", cnt: 0},
  {abap: "START-OF-SELECTION.\n  PERFORM run.\nMODULE foo OUTPUT.", cnt: 0},
  {abap: "MODULE foo OUTPUT.\n  foo = boo.", cnt: 0},
  {abap: "MODULE foo OUTPUT.\nfoo = boo.", cnt: 1},
  {abap: "CLASS foo IMPLEMENTATION.\n  PRIVATE SECTION.\n", cnt: 0},
  {abap: "SELECT * FROM vbak INTO TABLE lt_vbak.\nWITE 'foo'.\n", cnt: 0},
  {abap: "SELECT * FROM vbak INTO ls_vbak.\n  WRITE 'foo'.\nENDSELECT.", cnt: 0},
  {abap: "CLASS foo IMPLEMENTATION.\n  PRIVATE SECTION.\n    foo().", cnt: 0},
  {abap: "CLASS foo IMPLEMENTATION.\n  PRIVATE SECTION.\n    foo().\nENDCLASS.", cnt: 0},
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