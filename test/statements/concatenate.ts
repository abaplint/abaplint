import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("CONCATENATE statement type", () => {
  let tests = [
    "concatenate space space into lv_foo.",
    "CONCATENATE lv_tmp iv_pack INTO lv_xstring IN BYTE MODE.",
    "CONCATENATE lv_result '0' lv_bits+21(7) INTO lv_result.",
    "CONCATENATE foo bar INTO lv_result RESPECTING BLANKS.",
    "CONCATENATE <ls_node>-chmod <ls_node>-name INTO lv_string SEPARATED BY space.",
    "CONCATENATE lv_result lv_base+lv_offset(lv_len) INTO lv_result IN BYTE MODE.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be CONCATENATE", () => {
      let compare = slist[0] instanceof Statements.Concatenate;
      expect(compare).to.equals(true);
    });
  });
});
