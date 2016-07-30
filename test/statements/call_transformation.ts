import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("CALL TRANSFORMATION statement type", () => {
  let tests = [
      "CALL TRANSFORMATION id\n" +
      "  SOURCE data = is_data\n" +
      "  RESULT XML rv_xml.",

      "CALL TRANSFORMATION id\n" +
      "  OPTIONS value_handling = 'accept_data_loss'\n" +
      "  SOURCE XML lv_xml\n" +
      "  RESULT data = rs_data.",

      "CALL TRANSFORMATION id\n" +
      "  SOURCE (lt_stab)\n" +
      "  RESULT XML li_doc.",

      "CALL TRANSFORMATION id\n" +
      "  OPTIONS value_handling = 'accept_data_loss'\n" +
      "  SOURCE XML mi_xml_doc\n" +
      "  RESULT (lt_rtab).",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be CALL TRANSFORMATION", () => {
      let compare = slist[0] instanceof Statements.CallTransformation;
      expect(compare).to.equals(true);
    });
  });
});
