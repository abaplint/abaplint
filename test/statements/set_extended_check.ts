import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "SET EXTENDED CHECK OFF.",
  "SET EXTENDED CHECK ON.",
];

statementType(tests, "SET EXTENDED CHECK", Statements.SetExtendedCheck);