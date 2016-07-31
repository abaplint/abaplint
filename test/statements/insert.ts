import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INSERT tactz FROM TABLE lt_tactz.",
  "INSERT ls_stage INTO TABLE mt_stage.",
  "INSERT <ls_list>-icfhandler INTO TABLE rt_list.",
  "INSERT (c_tabname) FROM ls_table.",
];

statementType(tests, "INSERT", Statements.Insert);