import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SEARCH foo-bar FOR '/' STARTING AT 2.",
];

statementType(tests, "SEARCH", Statements.Search);