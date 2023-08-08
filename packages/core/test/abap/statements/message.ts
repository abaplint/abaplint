import {statementType, statementVersionOk, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

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
  "MESSAGE A600 WITH 'Moo'.",
  "message E001(0A) with 'FATAL' raising FATAL_ERROR.",
  "MESSAGE e019 RAISING tree_not-allowed.",
  "MESSAGE ID '00' TYPE 'E' NUMBER '000'.",
];

statementType(tests, "MESSAGE", Statements.Message);

const testsVersionOk = [
  {abap: `MESSAGE 'sdf' TYPE 'S'.`, ver: Version.v702},
  {abap: `MESSAGE e100(/foo/bar) WITH <fs>-sdf <fs>-sdf <fs>-sdf INTO l_message.`, ver: Version.Cloud},
  {abap: `MESSAGE e099(zcustom) RAISING input_not_valid.`, ver: Version.Cloud},
  {abap: `MESSAGE s443(zcustom) INTO l_message WITH lv_lines |sdfsdf|.`, ver: Version.Cloud},
  {abap: `MESSAGE ID l_return-id
  TYPE l_return-type
  NUMBER l_return-number
  WITH l_return-message_v1 l_return-message_v2 l_return-message_v3 l_return-message_v4
  INTO l_message.`, ver: Version.Cloud},
];

statementVersionOk(testsVersionOk, "MESSAGE", Statements.Message);

const testsVersionFail = [
  {abap: `MESSAGE |sdf| TYPE 'S'.`, ver: Version.v702},
  {abap: `message e101(00) with io_cx_excel->if_message~get_text( ) into lv_dummy.`, ver: Version.v702},
  {abap: `MESSAGE s000(oo) WITH mv_text rv_result.`, ver: Version.Cloud},
  {abap: `MESSAGE ix_exception TYPE 'S' DISPLAY LIKE 'E'.`, ver: Version.Cloud},
  {abap: `MESSAGE 'Commit was successful' TYPE 'S'.`, ver: Version.Cloud},
  {abap: `MESSAGE lv_text TYPE 'S'.`, ver: Version.Cloud},
  {abap: `MESSAGE s000(oo) WITH mv_text rv_result.`, ver: Version.Cloud},
];

statementVersionFail(testsVersionFail, "MESSAGE");