import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INSERT tactz FROM TABLE lt_tactz.",
  "INSERT zfoo.",
  "INSERT (c_tabname) FROM ls_table.",
];

statementType(tests, "INSERT", Statements.InsertDatabase);