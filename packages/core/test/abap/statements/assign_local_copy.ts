import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ASSIGN LOCAL COPY OF INITIAL LINE OF <table> TO <fs>.",
  "assign local copy of <lt_foo> to <lt_bar>.",
  "ASSIGN LOCAL COPY OF INITIAL (L_VAR) TO <WA>.",
  "ASSIGN LOCAL COPY OF INITIAL data[] TO <lt_data>.",
  `ASSIGN LOCAL COPY OF MAIN TABLE FIELD (gl_tabf) TO <feld>.`,
];

statementType(tests, "ASSIGN LOCAL COPY", Statements.AssignLocalCopy);

const versionsFail = [
  {abap: `ASSIGN LOCAL COPY OF INITIAL LINE OF <table> TO <fs>.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ASSIGN LOCAL COPY");
