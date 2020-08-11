import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "INSERT 'sdf' 'sdf' INTO header.", // this is a field group INSERT
];

statementType(tests, "INSERT field group", Statements.InsertFieldGroup);