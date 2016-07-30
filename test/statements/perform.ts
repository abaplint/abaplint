import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "PERFORM set_pf_status IN PROGRAM rsdbrunt IF FOUND.",
  "PERFORM create_variant USING <ls_classdf>-clsname.",
  "PERFORM run.",
];

statementType(tests, "PERFORM", Statements.Perform);