import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
    "READ LINE lv_line LINE VALUE INTO lv_text.",
  ];

statementType(tests, "READ LINE", Statements.ReadLine);