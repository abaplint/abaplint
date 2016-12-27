import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
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
  "MESSAGE i420(foo/) WITH foo bar.",
  "MESSAGE i420(foo!) WITH foo bar.",
  "message id sy-msgid type 'I' number sy-msgno display like 'E' with sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4.",
  "message id sy-msgid type 'I' number sy-msgno display like 'E'.",
  "message id sy-msgid type 'I' number sy-msgno.",
];

statementType(tests, "MESSAGE", Statements.Message);