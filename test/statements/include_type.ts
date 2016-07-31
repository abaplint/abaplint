import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "include type t_type.",
  "include type t_type as something.",
];

statementType(tests, "INCLUDE TYPE", Statements.IncludeType);