import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "interface if_ixml_node deferred.",
  "INTERFACE zif_foobar DEFERRED PUBLIC.",
];

statementType(tests, "INTERFACE DEFERRED", Statements.InterfaceDeferred);