import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "FORM name TABLES tt_fields TYPE ty_sval_tt USING pv_code TYPE clike \n" +
    "CHANGING cs_error TYPE svale RAISING lcx_exception.",
  "FORM send_mail USING pt_mail_data TYPE ANY TABLE.",
  "FORM foobar USING workarea.",
  "FORM top-of-page.",
  "FORM name USING VALUE(INDEX) LIKE SY-TABIX.",
  "FORM name USING foo VALUE(bar).",
  "FORM exit RAISING lcx_exception.",
  "FORM foobar USING    blah LIKE LINE OF gt_foo.",
  "form foobar using\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "foo type bar\n" +
    "bar type bar.",
  "form foobar using\n" +
    "foo bar\n" +
    "foo bar\n" +
    "foo bar\n" +
    "foo bar\n" +
    "foo bar\n" +
    "foo bar\n" +
    "foo bar\n" +
    "foo bar\n" +
    "foo bar\n" +
    "foo bar\n" +
    "foo bar\n" +
    "foo bar\n" +
    "foo bar\n" +
    "bar bar.",
//  "FORM foobar CHANGING blah LIKE gt_foo[].",
  "FORM back RAISING RESUMABLE(zcx_exception).",
  "FORM name USING foo like tab value(I_*BSEG) like BSEG value(I_BSEG) like BSEG.",
];

statementType(tests, "FORM", Statements.Form);