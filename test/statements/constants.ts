import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CONSTANTS c_cluster_type TYPE c VALUE 'C'.",
  "constants lc_empty type string value is initial.",
  "constants c_oo_class(7)      VALUE 'foobar'.",
  "constants /foo/bar type string value 'val'.",
  "CONSTANTS lc_foo TYPE string VALUE `foo` & `bar`.",
];

statementType(tests, "CONSTANT", Statements.Constant);