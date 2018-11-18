import {statementType, statementVersion} from "../_utils";
import * as Statements from "../../../src/abap/statements/";
import {Version} from "../../../src/version";

const tests = [
  "TYPES ty_type TYPE c LENGTH 6.",
  "TYPE ty_type TYPE c LENGTH 6.",
  "TYPES dummy.",
  "TYPES ty_foo_tt TYPE STANDARD TABLE OF lcl_repo=>ty_repo WITH DEFAULT KEY.",
  "TYPES ty_foo_tt TYPE STANDARD TABLE OF lcl_repo=>ty_repo-key WITH DEFAULT KEY.",
  "TYPES ty_foo_tt TYPE STANDARD TABLE OF ty_repo-key WITH DEFAULT KEY.",
  "type string1(236) TYPE c.",
  "types tt_table TYPE TABLE OF ty_field WITH NON-UNIQUE SORTED KEY bar COMPONENTS foo bar.",
  "TYPES /foo/ TYPE i.",
  "TYPES /foo/bar TYPE i.",
  "TYPES bar TYPE p LENGTH 5 DECIMALS 2.",
  "TYPES moo TYPE p DECIMALS 2 LENGTH 5.",
  "TYPES ty_bar TYPE STANDARD TABLE OF /foo/bar INITIAL SIZE 0 WITH DEFAULT KEY.",
  "TYPES name TYPE STANDARD TABLE OF something WITH NON-UNIQUE KEY !name.",
];

statementType(tests, "TYPE", Statements.Type);

const versions = [
  {abap: "types tt_foo TYPE STANDARD TABLE OF ty_foo WITH EMPTY KEY.", ver: Version.v740sp02},
];

statementVersion(versions, "TYPE", Statements.Type);