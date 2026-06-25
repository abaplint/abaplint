import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "DELETE FROM DATABASE lawdivindx(cu) ID 'LAW_CUSTOMER_CREDIT'.",
  "DELETE FROM DATABASE foo(ba) CLIENT sy-mandt ID key.",
  "DELETE FROM DATABASE /space/name(aa) ID lv_id.",
];

statementType(tests, "DELETE FROM DATABASE", Statements.DeleteCluster);

const versionsFail = [
  {abap: `DELETE FROM DATABASE lawdivindx(cu) ID 'LAW_CUSTOMER_CREDIT'.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "DELETE");
