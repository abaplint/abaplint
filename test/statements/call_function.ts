import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

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

  "CALL FUNCTION 'BANK_OBJ_WORKL_RELEASE_LOCKS' IN UPDATE TASK.",

  "CALL FUNCTION l_function\n" +
  " EXPORTING\n" +
  "   input  = ip_value\n" +
  " IMPORTING\n" +
  "   output = l_value\n" +
  " EXCEPTIONS\n" +
  "   OTHERS = 1.",

  "CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'\n" +
  " IN BACKGROUND TASK\n" +
  " DESTINATION iv_rfc_dest\n" +
  " EXPORTING\n" +
  "   wait = abap_true.",

  "CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'\n" +
  " DESTINATION iv_rfc_dest\n" +
  " EXPORTING\n" +
  "   wait = abap_true.",

  "CALL FUNCTION 'FM_NAME'\n" +
  " EXPORTING\n" +
  "   input = value\n" +
  " EXCEPTIONS\n" +
  "   OTHERS.",

  "CALL FUNCTION 'ZFOOBAR'\n" +
  " IN BACKGROUND TASK\n" +
  " EXPORTING\n" +
  "   field = lv_value.",

  "CALL FUNCTION 'RSSM_EVENT_RAISE'\n" +
  "  DESTINATION p_rfcdes\n" +
  "   EXPORTING\n" +
  "    i_eventid              = p_evid\n" +
  "    i_eventparm            = space\n" +
  "  EXCEPTIONS\n" +
  "    bad_eventid            = 1\n" +
  "    eventid_does_not_exist = 2\n" +
  "    eventid_missing        = 3\n" +
  "    raise_failed           = 4\n" +
  "    system_failure         = 5  MESSAGE lv_message\n" +
  "    communication_failure  = 6  MESSAGE lv_message\n" +
  "    resource_failure       = 7\n" +
  "    OTHERS                 = 8.",

  "CALL FUNCTION <ls_object_method>-methodname\n" +
  "  EXPORTING\n" +
  "    iv_client = lv_client\n" +
  "  TABLES\n" +
  "    tt_e071   = lt_cts_object_entry\n" +
  "    tt_e071k  = lt_cts_key.",

  "CALL FUNCTION 'WDYC_GET_OBJECT'\n" +
  "  PARAMETER-TABLE\n" +
  "    lt_fm_param\n" +
  "  EXCEPTION-TABLE\n" +
  "    lt_fm_exception.\n",

  "CALL CUSTOMER-FUNCTION '001'.",

  "CALL FUNCTION 'DYNPRO_DISPLAY'\n" +
  "  EXPORTING\n" +
  "    PROGRAM   = lv_program\n" +
  "    DYNPRO    = lv_dynpro\n" +
  "    FIELDNAME = lv_field\n" +
  "  EXCEPTIONS\n" +
  "    DYNPRO_NOT_FOUND.",

  "CALL FUNCTION 'TYPD_GET_OBJECT'\n" +
  "  EXPORTING\n" +
  "    typdname          = lv_typdname\n" +
  "  TABLES\n" +
  "    psmodisrc         = lt_psmodisrc\n" +
  "  EXCEPTIONS\n" +
  "    version_not_found = constant\n" +
  "    OTHERS            = 3.",

  "CALL FUNCTION 'ZFOOBAR'\n" +
  "  STARTING NEW TASK name\n" +
  "  DESTINATION IN GROUP DEFAULT\n" +
  "  CALLING callback ON END OF TASK.",

  "CALL FUNCTION 'ZFOOBAR'\n" +
  "  STARTING NEW TASK ls_foo-clsname\n" +
  "  DESTINATION IN GROUP p_group\n" +
  "  PERFORMING callback ON END OF TASK.",

/*
  "call function 'ZFOOBAR'\n" +
  "  exceptions\n" +
  "   no_auth               = 1\n" +
  "   system_failure        = 2 message msgtext\n" +
  "   communication_failure = 3 message msgtext\n" +
  "   others.",
*/
  "CALL FUNCTION 'GUI_UPLOAD'\n" +
  " EXPORTING\n" +
  "   filename                = l_sfile\n" +
  "   filetype                = 'BIN'\n" +
  " IMPORTING\n" +
  "   filelength              = l_len\n" +
  " TABLES\n" +
  "   data_tab                = lt_bin\n" +
  " EXCEPTIONS\n" +
  "   file_open_error         = 1\n" +
  "   file_read_error         = 2\n" +
  "   no_batch                = 3\n" +
  "   gui_refuse_filetransfer = 4\n" +
  "   invalid_type            = 5\n" +
  "   no_authority            = 6\n" +
  "   unknown_error           = 7\n" +
  "   bad_data_format         = 8\n" +
  "   header_not_allowed      = 9\n" +
  "   separator_not_allowed   = 10\n" +
  "   header_too_long         = 11\n" +
  "   unknown_dp_error        = 12\n" +
  "   access_denied           = 13\n" +
  "   dp_out_of_memory        = 14\n" +
  "   disk_full               = 15\n" +
  "   dp_timeout              = 16\n" +
  "   OTHERS                  = 17.",
/*
  "CALL FUNCTION 'ZFOOBAR'\n" +
  " EXCEPTIONS\n" +
  "   ERROR_A = -4\n" +
  "   ERROR_B = -6.",

  "CALL FUNCTION 'OWN_LOGICAL_SYSTEM_GET'\n" +
  "  IMPORTING\n" +
  "    OWN_LOGICAL_SYSTEM = lv_own\n" +
  "  EXCEPTIONS\n" +
  "    OTHERS             = GC_FOO-SYSTEM.",

  "call function 'FOOBAR'\n" +
  "  exporting\n" +
  "    header  = header\n" +
  "  tables\n" +
  "    details = details\n" +
  "  exceptions\n" +
  "    failed  = zcl_foo=>failed\n" +
  "    others  = zcl_foo=>others.",
*/
  "CALL FUNCTION 'GUI_UPLOAD'\n" +
  "  EXPORTING\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22\n" +
  "    filename = 22.",

  "CALL FUNCTION 'ZMOO' \n" +
  "  IN BACKGROUND TASK AS SEPARATE UNIT\n" +
  "    EXPORTING\n" +
  "      foo = bar.",

  "CALL FUNCTION 'Z_BOOK_PARALLEL_DEMO'\n" +
  "STARTING NEW TASK lv_task\n" +
  "DESTINATION IN GROUP DEFAULT\n" +
  "CALLING zif_book_parallel~on_task_complete ON END OF TASK\n" +
  "EXPORTING\n" +
  "  tiknr                 = mv_tiknr\n" +
  "  dateiname             = lv_file\n" +
  "EXCEPTIONS\n" +
  "  communication_failure = 1 MESSAGE lv_text\n" +
  "  system_failure        = 2 MESSAGE lv_text\n" +
  "  ressource_failure     = 3\n" +
  "  OTHERS                = 4.",

];

statementType(tests, "CALL FUNCTION", Statements.CallFunction);