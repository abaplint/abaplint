import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GET CURSOR FIELD f LINE l.",
  "get cursor line l.",
  "GET CURSOR OFFSET off.",
  "GET CURSOR FIELD gv_field.",
];

statementType(tests, "GET CURSOR", Statements.GetCursor);