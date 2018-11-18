import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "FIELD-GROUPS test.",
];

statementType(tests, "FIELD GROUP", Statements.FieldGroup);
