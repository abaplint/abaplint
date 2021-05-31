import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "NODES blah.",
];

statementType(tests, "NODES", Statements.Nodes);