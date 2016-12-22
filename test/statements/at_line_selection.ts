import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "AT LINE-SELECTION.",
];

statementType(tests, "AT LINE-SELECTION", Statements.AtLineSelection);