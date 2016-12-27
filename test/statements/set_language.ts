import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET LANGUAGE SY-LANGU.",
];

statementType(tests, "SET LANGUAGE", Statements.SetLanguage);