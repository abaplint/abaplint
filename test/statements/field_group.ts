import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "FIELD-GROUPS test.",
];

statementType(tests, "FIELD GROUP", Statements.FieldGroup);
