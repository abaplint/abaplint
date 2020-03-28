import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET EXTENDED CHECK OFF.",
  "SET EXTENDED CHECK ON.",
];

statementType(tests, "SET EXTENDED CHECK", Statements.SetExtendedCheck);