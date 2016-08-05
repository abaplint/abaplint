import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "REPORT zabapgit LINE-SIZE 100.",
  "REPORT.",
  "REPORT zabapgit.",
];

statementType(tests, "REPORT", Statements.Report);