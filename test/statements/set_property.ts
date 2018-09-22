import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "SET PROPERTY OF io_app_obj 'StatusBar' = 'OLE Call'.",
];

statementType(tests, "SET PROPERTY", Statements.SetProperty);