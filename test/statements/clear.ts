import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CLEAR foobar.",
  "CLEAR cg_value+sy-fdpos.",
  "CLEAR me->zif_foo~field.",
  "CLEAR ct_source[].",
];

statementType(tests, "CLEAR", Statements.Clear);