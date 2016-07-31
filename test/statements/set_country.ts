import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "set country 'DE'.",
];

statementType(tests, "SET COUNTRY", Statements.SetCountry);