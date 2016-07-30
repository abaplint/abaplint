import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("ASSIGN statement type", () => {
  let tests = [
    "ASSIGN COMPONENT ls_field-name OF STRUCTURE ig_file TO <lv_field>.",
    "ASSIGN ('(SAPLSIFP)TTAB') TO <lg_any>.",
    "ASSIGN cs_tstcp-param(sy-fdpos) TO <lg_f>.",
    "ASSIGN cs_tstcp-param(sdf) TO <lg_f>.",
    "ASSIGN cs_tstcp-param TO <lg_f>.",
    "ASSIGN lv_x TO <lv_y> CASTING.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be ASSIGN", () => {
      let compare = slist[0] instanceof Statements.Assign;
      expect(compare).to.equals(true);
    });
  });
});
