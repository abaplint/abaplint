import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "DELETE mt_stack INDEX lv_index.",
    ];

statementType(tests, "DELETE", Statements.Delete);