import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("LOOP statement type", () => {
  let tests = [
    "loop at foo into bar.",
    "LOOP AT lt_lines ASSIGNING <ls_line>.",
    "LOOP AT lt_branches FROM 1 ASSIGNING <ls_branch>.",
    "LOOP AT mt_diff TRANSPORTING NO FIELDS.",
    "LOOP AT mt_diff TRANSPORTING NO FIELDS WHERE foo = bar.",
    "LOOP AT it_methods ASSIGNING <ls_method2> FROM lv_index.",
    "LOOP AT it_tokens ASSIGNING <ls_token> FROM sdf TO to.",
    "LOOP AT lt_lines ASSIGNING <ls_line> WHERE moo = boo.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be LOOP", () => {
      let compare = slist[0] instanceof Statements.Loop;
      expect(compare).to.equals(true);
    });
  });
});
