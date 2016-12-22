import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "position lv_pos.",
];

statementType(tests, "POSITION", Statements.Position);