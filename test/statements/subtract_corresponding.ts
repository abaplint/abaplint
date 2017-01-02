import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SUBTRACT-CORRESPONDING foo FROM bar.",
];

statementType(tests, "SUBTRACT-CORRESPONDING", Statements.SubtractCorresponding);