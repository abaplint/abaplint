import {statementType, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
  "TEST-SEAM foo.",
  "TEST-SEAM foo-bar.",
];

statementType(tests, "TEST-SEAM", Statements.TestSeam);

statementVersionOk([
  {abap: "TEST-SEAM foo.", ver: Version.OpenABAP},
], "TEST-SEAM", Statements.TestSeam);

statementVersionOk([
  {abap: "END-TEST-SEAM.", ver: Version.OpenABAP},
], "END-TEST-SEAM", Statements.EndTestSeam);
