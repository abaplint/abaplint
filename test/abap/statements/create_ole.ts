import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CREATE OBJECT cv_ole_app lv_ole_app.",
];

statementType(tests, "CREATE OBJECT", Statements.CreateOLE);