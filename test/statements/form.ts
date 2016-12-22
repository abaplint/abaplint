import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "FORM name TABLES tt_fields TYPE ty_sval_tt USING pv_code TYPE clike CHANGING cs_error TYPE svale RAISING lcx_exception.",
  "FORM send_mail USING pt_mail_data TYPE ANY TABLE.",
  "FORM foobar USING workarea.",
  "FORM top-of-page.",
  "FORM name USING foo VALUE(bar).",
  "FORM exit RAISING lcx_exception.",
];

statementType(tests, "FORM", Statements.Form);