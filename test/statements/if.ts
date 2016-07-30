import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("IF statement type", () => {
  let tests = [
    "IF foo = bar.",
    "IF foo = bar AND moo = boo.",
    "IF go_gui IS NOT BOUND.",
    "IF lv_left >= strlen( mv_bits ).",
    "IF li_node IS BOUND.",
    "IF iv_str CA '/'.",
    "IF NOT it_tpool IS INITIAL.",
    "IF NOT it_tpool[] IS INITIAL.",
    "IF xstrlen( ls_file-file-data ) = 2.",
    "IF lines( lt_lines ) MOD 2 <> 0.",
    "IF iv_branch_name IS SUPPLIED.",
    "IF is_item-obj_name IS INITIAL.",
    "IF foo = bar OR moo = boo.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be IF", () => {
      let compare = slist[0] instanceof Statements.If;
      expect(compare).to.equals(true);
    });
  });
});
