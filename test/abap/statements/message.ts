import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "MESSAGE 'Saved' TYPE 'S'.",
  "MESSAGE 'Fill URL' TYPE 'S' DISPLAY LIKE 'E'.",
  "MESSAGE ID msgid TYPE msgty NUMBER msgno.",
  "MESSAGE ID msgid TYPE msgty NUMBER msgno WITH msgv1 msgv2 msgv3 msgv4 INTO lv_err.",
  "MESSAGE ID lr_return->id TYPE lr_return->type NUMBER lr_return->number INTO DATA(error_message) \n" +
    "WITH lr_return->message_v1 lr_return->message_v2 lr_return->message_v3 lr_return->message_v4.",
  "MESSAGE e800(zfoobar) INTO lv_message.",
  "message e059(0k) with 'error' raising fatal.",
  "message i420(foo#) with lv_var.",
  "MESSAGE i420(foo@) WITH foo bar.",
  "MESSAGE i420(foo@) WITH foo bar INTO loo.",
  "MESSAGE i420(foo@) WITH foo bar boo1 boo2 INTO loo.",
  "MESSAGE i420(foo/) WITH foo bar.",
  "MESSAGE i420(foo!) WITH foo bar.",
  "message id sy-msgid type 'I' number sy-msgno display like 'E' with sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4.",
  "message id sy-msgid type 'I' number sy-msgno display like 'E'.",
  "message id sy-msgid type 'I' number sy-msgno.",
  "MESSAGE w100(foo#) WITH ls_msg-msgv1.",
  "MESSAGE e001(a&) WITH lv_par1.",
  "MESSAGE e001(a>) RAISING exists.",
  "MESSAGE x001(>1) WITH 'foo'.",
  "MESSAGE e000(zz) INTO DATA(error1) WITH 'asdf' raising zsdf.",
  "MESSAGE e000(zz) INTO DATA(error2) raising zsdf WITH 'asdf'.",
  "MESSAGE e000(zz) RAISING zsdf INTO DATA(error3) WITH 'asdf'.",
  "MESSAGE e000(zz) WITH 'asdf' raising zsdf INTO DATA(error4).",
  "MESSAGE e000(zz) RAISING zsdf WITH 'asdf' into data(error5).",
  "MESSAGE 'sdf' TYPE 'E' RAISING cancel.",
];

statementType(tests, "MESSAGE", Statements.Message);