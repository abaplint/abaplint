import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "CALL METHOD OF lv_charts 'Add'.",
  "CALL METHOD OF io_app_obj 'Run' EXPORTING foo = bar.",
  "CALL METHOD OF io_app_obj 'Run' EXPORTING foo = 'sdf'.",
  "CALL METHOD OF io_app_obj 'Run' EXPORTING #1 = 'sdf'.",
  "CALL METHOD OF io_app_obj 'Run' EXPORTING #1 = 'MAIN.start' #2 = 'From SAP'.",
  "CALL METHOD OF lo_docs 'Open' = cv_ole_doc EXPORTING #1 = cv_fullpath.",
  "CALL METHOD OF moo-obj 'GetServ' = service NO FLUSH EXPORTING #1 = 'bar'.",
  "CALL METHOD OF app 'Create' = handle NO FLUSH QUEUE-ONLY.",
  "CALL METHOD OF var1 var2.",
  `CALL METHOD OF sdf-fds VERB = sdf->sdfa-sdf NO FLUSH QUEUE-ONLY.`,
  `CALL METHOD OF sdfsd 'field' = para
    NO FLUSH
    QUEUEONLY
    EXPORTING #1 = foo-bar
              #2 = param_id.`,
];

statementType(tests, "CALL METHOD OF", Statements.CallOLE);

const versionsFail = [
  {abap: `CALL METHOD OF lv_charts 'Add'.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CALL METHOD OF");
