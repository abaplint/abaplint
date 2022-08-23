import {statementExpectFail, statementType, statementVersion} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
  "TYPES ty_type TYPE c LENGTH 6.",
  "TYPES dummy.",
  "TYPES ty_foo_tt TYPE STANDARD TABLE OF lcl_repo=>ty_repo WITH DEFAULT KEY.",
  "TYPES ty_foo_tt TYPE STANDARD TABLE OF lcl_repo=>ty_repo-key WITH DEFAULT KEY.",
  "TYPES ty_foo_tt TYPE STANDARD TABLE OF ty_repo-key WITH DEFAULT KEY.",
  "types tt_table TYPE TABLE OF ty_field WITH NON-UNIQUE SORTED KEY bar COMPONENTS foo bar.",
  "TYPES /foo/ TYPE i.",
  "TYPES /foo/bar TYPE i.",
  "TYPES bar TYPE p LENGTH 5 DECIMALS 2.",
  "TYPES moo TYPE p DECIMALS 2 LENGTH 5.",
  "TYPES ty_bar TYPE STANDARD TABLE OF /foo/bar INITIAL SIZE 0 WITH DEFAULT KEY.",
  "TYPES name TYPE STANDARD TABLE OF something WITH NON-UNIQUE KEY !name.",
  "TYPES ty_objects TYPE RANGE OF trobjtype INITIAL SIZE 1.",
  "TYPES ty_overwrite_tt TYPE STANDARD TABLE OF ty_overwrite\n" +
  "  WITH DEFAULT KEY\n" +
  "  WITH UNIQUE HASHED KEY object_type_and_name COMPONENTS obj_type obj_name.",
  "TYPES tty_log_out TYPE STANDARD TABLE OF ty_log_out WITH NON-UNIQUE DEFAULT KEY.",
  "TYPES foo TYPE moo BOXED.",
  "TYPES ty_streenode_2 LIKE streenode OCCURS 10.",
  `TYPES foobar
    TYPE SORTED TABLE OF ty_moo
    WITH NON-UNIQUE KEY name
    WITH UNIQUE SORTED KEY key_alias COMPONENTS alias
    INITIAL SIZE 2.`,
  `TYPES ty_foo TYPE TABLE FOR CREATE EntityItem.`,
  `TYPES ty_foo TYPE TABLE FOR FAILED EntityItem.`,
  `TYPES ty_foo TYPE TABLE FOR LOCK EntityItem.`,
  `TYPES ty_foo TYPE TABLE FOR ACTION IMPORT EntityItem~add.`,
];

statementType(tests, "TYPE", Statements.Type);

const versions = [
  {abap: "types tt_foo TYPE STANDARD TABLE OF ty_foo WITH EMPTY KEY.", ver: Version.v740sp02},
];

statementVersion(versions, "TYPE", Statements.Type);


const fails = [
  `TYPES moo TYPE SORTED TABLE OF foo_bar WITH NON-UNIQUE KEY and with.`,
];
statementExpectFail(fails, "TYPES");
