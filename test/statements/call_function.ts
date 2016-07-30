import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("CALL FUNCTION statement type", () => {
  let tests = [
    "CALL FUNCTION 'DDIF_TTYP_GET'.",

    "CALL FUNCTION 'DDIF_TTYP_GET' EXPORTING name = lv_name.",

    "CALL FUNCTION 'TYPD_GET_OBJECT'\n" +
    "  EXPORTING\n" +
    "    typdname          = lv_typdname\n" +
    "  TABLES\n" +
    "    psmodisrc         = lt_psmodisrc\n" +
    "    psmodilog         = lt_psmodilog\n" +
    "    psource           = et_source\n" +
    "    ptrdir            = lt_ptrdir\n" +
    "  EXCEPTIONS\n" +
    "    version_not_found = 1\n" +
    "    reps_not_exist    = 2\n" +
    "    OTHERS            = 3.",

    "CALL FUNCTION 'ABAP4_CALL_TRANSACTION'\n" +
    "  STARTING NEW TASK 'GIT'\n" +
    "  EXPORTING\n" +
    "    tcode = 'SE93'.",

    "CALL FUNCTION 'RPY_TRANSACTION_INSERT'\n" +
    "  EXPORTING\n" +
    "    transaction             = ls_tstc-tcode\n" +
    "    program                 = ls_tstc-pgmna\n" +
    "    dynpro                  = lv_dynpro\n" +
    "    language                = mv_language\n" +
    "    development_class       = iv_package\n" +
    "    transaction_type        = lv_type\n" +
    "    shorttext               = ls_tstct-ttext\n" +
    "    foobar                  = sdf-asdf\n" +
    "  TABLES\n" +
    "    param_values            = lt_param_values\n" +
    "  EXCEPTIONS\n" +
    "    cancelled               = 1\n" +
    "    already_exist           = 2\n" +
    "    permission_error        = 3\n" +
    "    name_not_allowed        = 4\n" +
    "    name_conflict           = 5\n" +
    "    illegal_type            = 6\n" +
    "    object_inconsistent     = 7\n" +
    "    db_access_error         = 8\n" +
    "    OTHERS                  = 9.",

    "CALL FUNCTION 'PB_POPUP_PACKAGE_CREATE'\n" +
    "  CHANGING\n" +
    "    p_object_data    = ls_package_data\n" +
    "  EXCEPTIONS\n" +
    "    action_cancelled = 1.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be CALL FUNCTION", () => {
      let compare = slist[0] instanceof Statements.CallFunction;
      expect(compare).to.equals(true);
    });
  });
});
