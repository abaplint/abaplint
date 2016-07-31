import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GET REFERENCE OF ig_data INTO <ls_stab>-value.",
];

statementType(tests, "GET REFERENCE", Statements.GetReference);