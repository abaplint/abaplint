import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "CONSTANTS c_cluster_type TYPE c VALUE 'C'.",
  "constants lc_empty type string value is initial.",
  "constants c_oo_class(7)      VALUE 'foobar'.",
  "constants /foo/bar type string value 'val'.",
  "CONSTANTS $blah TYPE syst-msgty VALUE 'I'.",
  "CONSTANTS lc_foo TYPE string VALUE `foo` & `bar`.",
];

statementType(tests, "CONSTANT", Statements.Constant);