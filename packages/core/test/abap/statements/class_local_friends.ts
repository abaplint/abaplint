import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CLASS zcl_abapgit_xml_output DEFINITION LOCAL FRIENDS ltcl_xml_output.",
  "CLASS /foo/cl_bar DEFINITION LOCAL FRIENDS LCL_/foo/bar.",
  "CLASS zcl_aoc_super DEFINITION LOCAL FRIENDS ltcl_test.",
];

statementType(tests, "CLASS other", Statements.ClassLocalFriends);