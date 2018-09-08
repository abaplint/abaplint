import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CREATE OBJECT cv_ole_app lv_ole_app.",
];

statementType(tests, "CREATE OBJECT", Statements.CreateOLE);