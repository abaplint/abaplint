import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "CONSTANTS c_cluster_type TYPE c VALUE 'C'.",
  "constants lc_empty type string value is initial.",
  "constants c_oo_class(7)      VALUE 'foobar'.",
  "constants /foo/bar type string value 'val'.",
  "CONSTANTS $blah TYPE syst-msgty VALUE 'I'.",
  "CONSTANTS lc_foo TYPE string VALUE `foo` & `bar`.",
  "CONSTANTS id1 TYPE x LENGTH 2 VALUE '1122'.",
  "CONSTANTS id2 VALUE '1122' TYPE x LENGTH 2.",
  "CONSTANTS id3 VALUE '1122' LENGTH 2 TYPE x.",
];

statementType(tests, "CONSTANT", Statements.Constant);