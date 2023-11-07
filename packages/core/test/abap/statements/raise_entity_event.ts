import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "RAISE ENTITY EVENT /foo/bar~send FROM lt_events.",
];

statementType(tests, "RAISE EVENT", Statements.RaiseEntityEvent);