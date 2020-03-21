import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET PROPERTY OF io_app_obj 'StatusBar' = 'OLE Call'.",
];

statementType(tests, "SET PROPERTY", Statements.SetProperty);