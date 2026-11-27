import {SortEmptyKey} from "../../src/rules/sort_empty_key";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

  // the defect, a table with an empty primary key
  {abap: `TYPES ty_t_names TYPE STANDARD TABLE OF string WITH EMPTY KEY.
DATA result TYPE ty_t_names.
SORT result.
DELETE ADJACENT DUPLICATES FROM result.`, cnt: 2, fix: true},
  {abap: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
SORT result DESCENDING.`, cnt: 1, fix: true},
  {abap: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
DATA(copy) = result.
SORT copy.`, cnt: 1},
  {abap: `TYPES: BEGIN OF ty_s,
         name TYPE string,
       END OF ty_s.
DATA tab TYPE STANDARD TABLE OF ty_s WITH EMPTY KEY.
SORT tab.`, cnt: 1, fix: false},
  {abap: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
FIELD-SYMBOLS <tab> LIKE result.
ASSIGN result TO <tab>.
SORT <tab>.`, cnt: 1},
  {abap: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
SORT: result, result.`, cnt: 2},
  {abap: `TYPES: BEGIN OF ty_s,
         names TYPE STANDARD TABLE OF string WITH EMPTY KEY,
       END OF ty_s.
DATA ls TYPE ty_s.
SORT ls-names.`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA mt_names TYPE STANDARD TABLE OF string WITH EMPTY KEY.
    CLASS-DATA gt_names TYPE STANDARD TABLE OF string WITH EMPTY KEY.
    METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    SORT me->mt_names.
    SORT mt_names.
    SORT lcl=>gt_names.
  ENDMETHOD.
ENDCLASS.`, cnt: 3},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty_t_names TYPE STANDARD TABLE OF string WITH EMPTY KEY.
    CLASS-METHODS get_implementers RETURNING VALUE(result) TYPE ty_t_names.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD get_implementers.
    SORT result.
    DELETE ADJACENT DUPLICATES FROM result.
  ENDMETHOD.
ENDCLASS.`, cnt: 2},

  // access through the empty primary key, FROM wa always finds the first row
  {abap: `DATA lt TYPE STANDARD TABLE OF string WITH EMPTY KEY.
DATA ls TYPE string.
READ TABLE lt FROM ls TRANSPORTING NO FIELDS.
READ TABLE lt FROM ls INTO ls.
DELETE TABLE lt FROM ls.
MODIFY TABLE lt FROM ls.`, cnt: 4, fix: false},
  {abap: `TYPES: BEGIN OF ty_s,
         name TYPE string,
         names TYPE STANDARD TABLE OF string WITH EMPTY KEY,
       END OF ty_s.
DATA lt TYPE STANDARD TABLE OF ty_s WITH EMPTY KEY.
DATA ls TYPE ty_s.
FIELD-SYMBOLS <lt> LIKE lt.
ASSIGN lt TO <lt>.
DELETE TABLE lt FROM ls.
MODIFY TABLE lt FROM ls TRANSPORTING name.
READ TABLE <lt> FROM ls TRANSPORTING NO FIELDS.
READ TABLE ls-names FROM ls-name TRANSPORTING NO FIELDS.
DELETE TABLE ls-names FROM ls-name.`, cnt: 5},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA mt_names TYPE STANDARD TABLE OF string WITH EMPTY KEY.
    CLASS-DATA gt_names TYPE STANDARD TABLE OF string WITH EMPTY KEY.
    METHODS run IMPORTING iv_name TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    READ TABLE me->mt_names FROM iv_name TRANSPORTING NO FIELDS.
    READ TABLE lcl=>gt_names FROM iv_name TRANSPORTING NO FIELDS.
    DELETE TABLE mt_names FROM iv_name.
  ENDMETHOD.
ENDCLASS.`, cnt: 3},

  // access by index, free key, WHERE or a secondary key
  {abap: `DATA lt TYPE STANDARD TABLE OF string WITH EMPTY KEY WITH NON-UNIQUE SORTED KEY sec COMPONENTS table_line.
DATA ls TYPE string.
READ TABLE lt INDEX 1 INTO ls.
READ TABLE lt INTO ls INDEX 1.
READ TABLE lt WITH KEY table_line = ls TRANSPORTING NO FIELDS.
READ TABLE lt FROM ls USING KEY sec TRANSPORTING NO FIELDS.
DELETE TABLE lt FROM ls USING KEY sec.
DELETE TABLE lt WITH TABLE KEY sec COMPONENTS table_line = ls.
DELETE lt WHERE table_line = ls.
DELETE lt INDEX 1.
DELETE lt FROM 2.
DELETE lt FROM 2 TO 3.
MODIFY lt FROM ls INDEX 1.
MODIFY lt INDEX 1 FROM ls.
MODIFY lt FROM ls TRANSPORTING table_line WHERE table_line = ls.
MODIFY TABLE lt FROM ls USING KEY sec.
LOOP AT lt INTO ls.
  MODIFY lt FROM ls.
  DELETE lt.
ENDLOOP.`, cnt: 0},

  // access through a default or explicit key, sorted and hashed tables
  {abap: `DATA lt TYPE TABLE OF string.
DATA ls TYPE string.
READ TABLE lt FROM ls TRANSPORTING NO FIELDS.
DELETE TABLE lt FROM ls.
MODIFY TABLE lt FROM ls.`, cnt: 0},
  {abap: `DATA lt TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
DATA ls TYPE string.
READ TABLE lt FROM ls TRANSPORTING NO FIELDS.
DELETE TABLE lt FROM ls.
MODIFY TABLE lt FROM ls.`, cnt: 0},
  {abap: `DATA lt TYPE STANDARD TABLE OF string WITH NON-UNIQUE KEY table_line.
DATA ls TYPE string.
READ TABLE lt FROM ls TRANSPORTING NO FIELDS.
READ TABLE lt WITH TABLE KEY table_line = ls TRANSPORTING NO FIELDS.
DELETE TABLE lt FROM ls.
DELETE TABLE lt WITH TABLE KEY table_line = ls.
MODIFY TABLE lt FROM ls.`, cnt: 0},
  {abap: `DATA lt TYPE SORTED TABLE OF string WITH UNIQUE KEY table_line.
DATA lh TYPE HASHED TABLE OF string WITH UNIQUE KEY table_line.
DATA ls TYPE string.
READ TABLE lt FROM ls TRANSPORTING NO FIELDS.
DELETE TABLE lt FROM ls.
READ TABLE lh FROM ls TRANSPORTING NO FIELDS.
DELETE TABLE lh FROM ls.
MODIFY TABLE lh FROM ls.`, cnt: 0},

  // access through the key of an unknown, void or generic table
  {abap: `DATA ls TYPE string.
DATA lt_void TYPE void_table_type.
READ TABLE unknown FROM ls TRANSPORTING NO FIELDS.
DELETE TABLE unknown FROM ls.
MODIFY TABLE unknown FROM ls.
DELETE TABLE lt_void FROM ls.`, cnt: 0},
  {abap: `FORM foo USING tab TYPE STANDARD TABLE row TYPE any.
  FIELD-SYMBOLS <tab> TYPE ANY TABLE.
  READ TABLE tab FROM row TRANSPORTING NO FIELDS.
  DELETE TABLE tab FROM row.
  MODIFY TABLE tab FROM row.
  DELETE TABLE <tab> FROM row.
ENDFORM.`, cnt: 0},

  // BY and COMPARING
  {abap: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
SORT result BY table_line.
DELETE ADJACENT DUPLICATES FROM result COMPARING table_line.`, cnt: 0},
  {abap: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
DELETE ADJACENT DUPLICATES FROM result COMPARING ALL FIELDS.`, cnt: 0},

  // a secondary key
  {abap: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY WITH NON-UNIQUE SORTED KEY sec COMPONENTS table_line.
DELETE ADJACENT DUPLICATES FROM result USING KEY sec.`, cnt: 0},

  // default and explicit keys
  {abap: `DATA result TYPE TABLE OF string.
SORT result.
DELETE ADJACENT DUPLICATES FROM result.`, cnt: 0},
  {abap: `DATA result TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
SORT result.
DELETE ADJACENT DUPLICATES FROM result.`, cnt: 0},
  {abap: `DATA result TYPE STANDARD TABLE OF string WITH NON-UNIQUE KEY table_line.
SORT result.
DELETE ADJACENT DUPLICATES FROM result.`, cnt: 0},
  {abap: `DATA result TYPE string_table.
SORT result.`, cnt: 0},

  // sorted and hashed tables
  {abap: `DATA result TYPE SORTED TABLE OF string WITH UNIQUE KEY table_line.
DELETE ADJACENT DUPLICATES FROM result.`, cnt: 0},
  {abap: `DATA result TYPE HASHED TABLE OF string WITH UNIQUE KEY table_line.
SORT result.`, cnt: 0},

  // unknown or generic
  {abap: `SORT unknown.`, cnt: 0},
  {abap: `FORM foo USING tab TYPE STANDARD TABLE.
  SORT tab.
ENDFORM.`, cnt: 0},
  {abap: `FIELD-SYMBOLS <tab> TYPE ANY TABLE.
SORT <tab>.`, cnt: 0},
];

testRule(tests, SortEmptyKey);

// the access through the table key switched off, SORT is still reported
const config = new SortEmptyKey().getConfig();
config.tableKeyAccess = false;
testRule([
  {abap: `DATA lt TYPE STANDARD TABLE OF string WITH EMPTY KEY.
DATA ls TYPE string.
READ TABLE lt FROM ls TRANSPORTING NO FIELDS.
DELETE TABLE lt FROM ls.
MODIFY TABLE lt FROM ls.`, cnt: 0},
  {abap: `DATA lt TYPE STANDARD TABLE OF string WITH EMPTY KEY.
SORT lt.`, cnt: 1},
], SortEmptyKey, config);

const fixes = [
  {
    input: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
SORT result.`,
    output: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
SORT result BY table_line.`,
  },
  {
    input: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
DELETE ADJACENT DUPLICATES FROM result.`,
    output: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
DELETE ADJACENT DUPLICATES FROM result COMPARING table_line.`,
  },
  {
    input: `DATA result TYPE STANDARD TABLE OF i WITH EMPTY KEY.
SORT result DESCENDING.`,
    output: `DATA result TYPE STANDARD TABLE OF i WITH EMPTY KEY.
SORT result DESCENDING BY table_line.`,
  },
];

testRuleFix(fixes, SortEmptyKey);
