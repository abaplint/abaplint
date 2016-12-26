import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GET CURSOR FIELD f LINE l.",
  "get cursor line l.",
  "GET CURSOR OFFSET off.",
  "GET CURSOR FIELD gv_field.",
  "GET CURSOR LINE lin OFFSET off VALUE val LENGTH len.",
];

statementType(tests, "GET CURSOR", Statements.GetCursor);