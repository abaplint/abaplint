import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "AT LINE-SELECTION.",
];

statementType(tests, "AT LINE-SELECTION", Statements.AtLineSelection);