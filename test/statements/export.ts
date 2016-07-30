import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "EXPORT foo TO MEMORY ID 'MOO'.",
    "EXPORT list = it_list TO DATA BUFFER lv_xstring COMPRESSION ON.",
    "EXPORT mv_errty = mv_errty TO DATA BUFFER p_attributes.",
    ];

statementType(tests, "EXPORT", Statements.Export);