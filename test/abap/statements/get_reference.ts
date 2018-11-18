import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "GET REFERENCE OF ig_data INTO <ls_stab>-value.",
];

statementType(tests, "GET REFERENCE", Statements.GetReference);