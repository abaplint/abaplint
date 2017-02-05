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
  "FORM back RAISING RESUMABLE(zcx_exception).",
  "FORM name USING foo like tab value(I_*BSEG) like BSEG value(I_BSEG) like BSEG.",
  "FORM read USING iv_foo TYPE /name/type.",
  "FORM read TABLES et_tab STRUCTURE /foo/bar.",
  "FORM foo CHANGING field-bar.",
  "FORM /foo/bar.",
  "FORM foo-bar.",
  "FORM foo--bar.",
  "FORM foo--.",

  "form foobar using\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  foo type bar\n" +
  "  bar type bar.",

  "form foobar using\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  foo bar\n" +
  "  bar bar.",

  "FORM read USING\n" +
  "  it_foo01 TYPE ANY TABLE\n" +
  "  it_foo02 TYPE ANY TABLE\n" +
  "  it_foo03 TYPE ANY TABLE\n" +
  "  it_foo04 TYPE ANY TABLE\n" +
  "  it_foo05 TYPE ANY TABLE\n" +
  "  it_foo06 TYPE ANY TABLE\n" +
  "  it_foo07 TYPE ANY TABLE\n" +
  "  it_foo08 TYPE ANY TABLE\n" +
  "  it_foo09 TYPE ANY TABLE\n" +
  "  it_foo10 TYPE ANY TABLE\n" +
  "  it_foo11 TYPE ANY TABLE.",

  "FORM action USING\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE\n" +
  "  foo TYPE STANDARD TABLE.",

  "form action tables\n" +
  "  foo structure bar\n" +
  "  foo structure bar\n" +
  "  foo structure bar\n" +
  "  foo structure bar\n" +
  "  foo structure bar\n" +
  "  foo structure bar\n" +
  "  foo structure bar\n" +
  "  foo structure bar\n" +
  "  using\n" +
  "  moo like boo\n" +
  "  moo like boo\n" +
  "  moo like boo\n" +
  "  moo like boo\n" +
  "  moo like boo\n" +
  "  moo like boo\n" +
  "  moo like boo\n" +
  "  moo like boo\n" +
  "  moo like boo\n" +
  "  moo like boo.",
];

statementType(tests, "FORM", Statements.Form);