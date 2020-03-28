import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "FIELD-GROUPS test.",
];

statementType(tests, "FIELD GROUP", Statements.FieldGroup);
