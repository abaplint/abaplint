import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET PROPERTY OF io_app_obj 'StatusBar' = 'OLE Call'.",
  "SET PROPERTY OF cell 'Text' = text NO FLUSH.",
  "SET PROPERTY OF foo-bar PROPERTY = value NO FLUSH EXPORTING foo = P1.",
  "SET PROPERTY OF foo-bar PROPERTY = value NO FLUSH EXPORTING #1 = P1 #2 = P2.",
];

statementType(tests, "SET PROPERTY", Statements.SetProperty);