import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ON CHANGE OF structure-field.",
  "ON CHANGE OF gt_tab-field1 OR gt_tab-field2.",
];

statementType(tests, "ON CHANGE", Statements.OnChange);