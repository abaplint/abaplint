import {statementExpectFail, statementType, statementVersion, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

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
  `TYPES ty_foo TYPE TABLE FOR ACTION IMPORT EntityItem~add.`,
  `TYPES ty_foo TYPE TABLE FOR ACTION IMPORT EntityItem~add.`,
  `TYPES ty1 TYPE STANDARD TABLE OF i WITH EMPTY KEY WITHOUT FURTHER SECONDARY KEYS.`,
  `TYPES ty2 TYPE STANDARD TABLE OF i WITH EMPTY KEY WITH FURTHER SECONDARY KEYS.`,
  `types ty TYPE STRUCTURE FOR HIERARCHY /foo/bar.`,
  `TYPES t_prot TYPE s_prot OCCURS fix_row.`,
  `TYPES line# TYPE i.`,
  `TYPES li#ne TYPE i.`,
  `TYPES tt_failed_root TYPE TABLE FOR FAILED EARLY /dmo/fsa_r_roottp\\\\root.`,
  `TYPES tt_reported_root TYPE TABLE FOR REPORTED EARLY /dmo/fsa_r_roottp\\\\root.`,
  `TYPES t_failed TYPE RESPONSE FOR FAILED EARLY ZDMO_R_RAPG_ProjectTP.`,
  `TYPES t_mapped TYPE RESPONSE FOR MAPPED EARLY ZDMO_R_RAPG_ProjectTP.`,
  `TYPES t_reported TYPE RESPONSE FOR REPORTED EARLY ZDMO_R_RAPG_ProjectTP.  `,
  `TYPES /foo/bar/foo/bar TYPE c.`,
  `types ty_s_sbu_upd_ind type /foo/bar with indicators upddd type abap_bool.`,
  `TYPES indicatortype TYPE ty WITH INDICATORS ind.`,
//  `TYPES ttyp TYPE SORTED TABLE OF ty WITH UNIQUE KEY 2fieldname.`,
];

statementType(tests, "TYPE", Statements.Type);

const versions = [
  {abap: "types tt_foo TYPE STANDARD TABLE OF ty_foo WITH EMPTY KEY.", rel: Release.v740sp02},
];

statementVersion(versions, "TYPE", Statements.Type);

const fails = [
  `TYPES ty_itab TYPE STANDARD TABLE string.`,
  `TYPES moo TYPE SORTED TABLE OF foo_bar WITH NON-UNIQUE KEY and with.`,
  `TYPES something TYPE STANDARD TABLE OF  WITH DEFAULT KEY.`,
];
statementExpectFail(fails, "TYPES");

const ok = [
  {abap: `TYPES !ty_moo TYPE string.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
  {abap: `TYPES !ty_moo TYPE string.`, rel: Release.v740sp02},
];

statementVersionOk(ok, "TYPES", Statements.Type);

// === RAP derived types ===

statementVersionOk([
  {abap: "TYPES t TYPE TABLE FOR ACTION IMPORT zentity~zaction.", rel: Release.v773},
  {abap: "TYPES t TYPE TABLE FOR ACTION RESULT zentity~zaction.", rel: Release.v773},
  {abap: "TYPES t TYPE TABLE FOR FUNCTION IMPORT zentity~zfn.", rel: Release.v773},
  {abap: "TYPES t TYPE TABLE FOR FUNCTION RESULT zentity~zfn.", rel: Release.v773},
], "TYPES RAP TABLE FOR ACTION/FUNCTION v773", Statements.Type);

statementVersionOk([
  {abap: "TYPES t TYPE STRUCTURE FOR ACTION IMPORT zentity~zaction.", rel: Release.v774},
  {abap: "TYPES t TYPE STRUCTURE FOR ACTION RESULT zentity~zaction.", rel: Release.v774},
  {abap: "TYPES t TYPE STRUCTURE FOR FUNCTION IMPORT zentity~zfn.", rel: Release.v774},
  {abap: "TYPES t TYPE STRUCTURE FOR FUNCTION RESULT zentity~zfn.", rel: Release.v774},
], "TYPES RAP STRUCTURE FOR ACTION/FUNCTION v774", Statements.Type);

statementVersionOk([
  {abap: "TYPES t TYPE TABLE FOR FAILED LATE zentity.", rel: Release.v774},
  {abap: "TYPES t TYPE TABLE FOR MAPPED LATE zentity.", rel: Release.v774},
  {abap: "TYPES t TYPE TABLE FOR REPORTED LATE zentity.", rel: Release.v774},
  {abap: "TYPES t TYPE STRUCTURE FOR FAILED LATE zentity.", rel: Release.v774},
  {abap: "TYPES t TYPE STRUCTURE FOR MAPPED LATE zentity.", rel: Release.v774},
  {abap: "TYPES t TYPE STRUCTURE FOR REPORTED LATE zentity.", rel: Release.v774},
], "TYPES RAP *LATE v774", Statements.Type);

statementVersionOk([
  {abap: "TYPES t TYPE TABLE FOR KEY OF zentity.", rel: Release.v775},
  {abap: "TYPES t TYPE STRUCTURE FOR KEY OF zentity.", rel: Release.v775},
], "TYPES RAP KEY OF v775", Statements.Type);

statementVersionOk([
  {abap: "TYPES t TYPE TABLE FOR DETERMINATION zentity~zdet.", rel: Release.v776},
  {abap: "TYPES t TYPE TABLE FOR FAILED zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE TABLE FOR FEATURES KEY zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE TABLE FOR FEATURES RESULT zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE TABLE FOR MAPPED zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE TABLE FOR REPORTED zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE TABLE FOR VALIDATION zentity~zval.", rel: Release.v776},
  {abap: "TYPES t TYPE STRUCTURE FOR DETERMINATION zentity~zdet.", rel: Release.v776},
  {abap: "TYPES t TYPE STRUCTURE FOR FAILED zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE STRUCTURE FOR FEATURES KEY zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE STRUCTURE FOR FEATURES REQUEST zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE STRUCTURE FOR FEATURES RESULT zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE STRUCTURE FOR MAPPED zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE STRUCTURE FOR REPORTED zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE STRUCTURE FOR VALIDATION zentity~zval.", rel: Release.v776},
  {abap: "TYPES t TYPE RESPONSE FOR FAILED zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE RESPONSE FOR FAILED LATE zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE RESPONSE FOR MAPPED zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE RESPONSE FOR MAPPED LATE zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE RESPONSE FOR REPORTED zentity.", rel: Release.v776},
  {abap: "TYPES t TYPE RESPONSE FOR REPORTED LATE zentity.", rel: Release.v776},
], "TYPES RAP v776", Statements.Type);

statementVersionOk([
  {abap: "TYPES t TYPE TABLE FOR LOCK zentity.", rel: Release.v777},
  {abap: "TYPES t TYPE STRUCTURE FOR LOCK zentity.", rel: Release.v777},
  {abap: "TYPES t TYPE TABLE FOR FAILED EARLY zentity.", rel: Release.v777},
  {abap: "TYPES t TYPE TABLE FOR MAPPED EARLY zentity.", rel: Release.v777},
  {abap: "TYPES t TYPE TABLE FOR REPORTED EARLY zentity.", rel: Release.v777},
  {abap: "TYPES t TYPE STRUCTURE FOR FAILED EARLY zentity.", rel: Release.v777},
  {abap: "TYPES t TYPE STRUCTURE FOR MAPPED EARLY zentity.", rel: Release.v777},
  {abap: "TYPES t TYPE STRUCTURE FOR REPORTED EARLY zentity.", rel: Release.v777},
  {abap: "TYPES t TYPE RESPONSE FOR FAILED EARLY zentity.", rel: Release.v777},
  {abap: "TYPES t TYPE RESPONSE FOR MAPPED EARLY zentity.", rel: Release.v777},
  {abap: "TYPES t TYPE RESPONSE FOR REPORTED EARLY zentity.", rel: Release.v777},
], "TYPES RAP *EARLY v777", Statements.Type);

statementVersionOk([
  {abap: "TYPES t TYPE TABLE FOR CHANGE zentity.", rel: Release.v778},
  {abap: "TYPES t TYPE STRUCTURE FOR CHANGE zentity.", rel: Release.v778},
  {abap: "TYPES t TYPE REQUEST FOR CHANGE zentity.", rel: Release.v778},
  {abap: "TYPES t TYPE REQUEST FOR DELETE zentity.", rel: Release.v778},
], "TYPES RAP CHANGE/DELETE v778", Statements.Type);

statementVersionOk([
  {abap: "TYPES t TYPE STRUCTURE FOR ACTION REQUEST zentity~zaction.", rel: Release.v779},
  {abap: "TYPES t TYPE STRUCTURE FOR FUNCTION REQUEST zentity~zfn.", rel: Release.v779},
], "TYPES RAP REQUEST v779", Statements.Type);

statementVersionOk([
  {abap: "TYPES t TYPE TABLE FOR AUTHORIZATION RESULT zentity.", rel: Release.v780},
  {abap: "TYPES t TYPE TABLE FOR PERMISSIONS KEY zentity.", rel: Release.v780},
  {abap: "TYPES t TYPE STRUCTURE FOR AUTHORIZATION REQUEST zentity.", rel: Release.v780},
  {abap: "TYPES t TYPE STRUCTURE FOR AUTHORIZATION RESULT zentity.", rel: Release.v780},
  {abap: "TYPES t TYPE STRUCTURE FOR PERMISSIONS KEY zentity.", rel: Release.v780},
  {abap: "TYPES t TYPE STRUCTURE FOR PERMISSIONS REQUEST zentity.", rel: Release.v780},
  {abap: "TYPES t TYPE STRUCTURE FOR PERMISSIONS RESULT zentity.", rel: Release.v780},
], "TYPES RAP PERMISSIONS/AUTH v780", Statements.Type);

statementVersionOk([
  {abap: "TYPES t TYPE TABLE FOR AUTHORIZATION KEY zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE TABLE FOR FEATURES KEY zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE TABLE FOR INSTANCE AUTHORIZATION KEY zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE TABLE FOR INSTANCE AUTHORIZATION REQUEST zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE TABLE FOR INSTANCE AUTHORIZATION RESULT zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE TABLE FOR INSTANCE FEATURES KEY zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE TABLE FOR INSTANCE FEATURES REQUEST zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE TABLE FOR INSTANCE FEATURES RESULT zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE STRUCTURE FOR AUTHORIZATION KEY zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE STRUCTURE FOR INSTANCE AUTHORIZATION KEY zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE STRUCTURE FOR INSTANCE AUTHORIZATION REQUEST zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE STRUCTURE FOR INSTANCE AUTHORIZATION RESULT zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE STRUCTURE FOR INSTANCE FEATURES KEY zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE STRUCTURE FOR INSTANCE FEATURES REQUEST zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE STRUCTURE FOR INSTANCE FEATURES RESULT zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE STRUCTURE FOR GLOBAL AUTHORIZATION REQUEST zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE STRUCTURE FOR GLOBAL AUTHORIZATION RESULT zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE STRUCTURE FOR GLOBAL FEATURES REQUEST zentity.", rel: Release.v781},
  {abap: "TYPES t TYPE STRUCTURE FOR GLOBAL FEATURES RESULT zentity.", rel: Release.v781},
], "TYPES RAP GLOBAL/INSTANCE v781", Statements.Type);

statementVersionOk([
  {abap: "TYPES t TYPE TABLE FOR READ CHANGES zentity.", rel: Release.v915},
  {abap: "TYPES t TYPE STRUCTURE FOR READ CHANGES zentity.", rel: Release.v915},
], "TYPES RAP READ CHANGES v915", Statements.Type);