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
