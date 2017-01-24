import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DELETE FROM DATABASE lawdivindx(cu) ID 'LAW_CUSTOMER_CREDIT'.",
];

statementType(tests, "DELETE FROM DATABASE", Statements.DeleteCluster);