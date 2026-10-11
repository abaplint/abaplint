import {DeleteIndexInLoop} from "../../src/rules/delete_index_in_loop";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

  {abap: `LOOP AT tab INTO row.
  DELETE tab INDEX sy-tabix.
ENDLOOP.`, cnt: 1},
  {abap: `LOOP AT tab ASSIGNING <row>.
  IF <row>-flag = abap_true.
    DELETE tab INDEX sy-tabix.
  ENDIF.
ENDLOOP.`, cnt: 1},
  {abap: `LOOP AT tab INTO row WHERE flag = abap_true.
  delete tab index SY-TABIX.
ENDLOOP.`, cnt: 1},
  {abap: `LOOP AT tab INTO row.
  READ TABLE other INTO line INDEX 1.
  DELETE tab INDEX sy-tabix.
ENDLOOP.`, cnt: 1},
  // sy-tabix belongs to the inner loop
  {abap: `LOOP AT outer INTO row.
  LOOP AT inner INTO line.
    DELETE outer INDEX sy-tabix.
  ENDLOOP.
ENDLOOP.`, cnt: 1},
  {abap: `LOOP AT outer INTO row.
  LOOP AT inner INTO line.
  ENDLOOP.
  DELETE outer INDEX sy-tabix.
ENDLOOP.`, cnt: 1},
  {abap: `LOOP AT me->tab INTO row.
  DELETE me->tab INDEX sy-tabix.
ENDLOOP.`, cnt: 1},

  // read-then-delete
  {abap: `READ TABLE tab INTO row WITH KEY id = 1.
DELETE tab INDEX sy-tabix.`, cnt: 0},
  {abap: `LOOP AT other INTO line.
  READ TABLE tab INTO row WITH KEY id = line-id.
  DELETE tab INDEX sy-tabix.
ENDLOOP.`, cnt: 0},
  {abap: `LOOP AT tab INTO row.
  READ TABLE tab TRANSPORTING NO FIELDS WITH KEY id = row-parent.
  " the parent
  DELETE tab INDEX sy-tabix.
ENDLOOP.`, cnt: 0},

  {abap: `LOOP AT tab INTO row.
  DELETE other INDEX sy-tabix.
ENDLOOP.`, cnt: 0},
  {abap: `DELETE tab INDEX sy-tabix.`, cnt: 0},
  {abap: `LOOP AT tab INTO row.
  DELETE tab WHERE flag = abap_true.
ENDLOOP.`, cnt: 0},
  {abap: `LOOP AT tab INTO row.
  DELETE tab INDEX 1.
ENDLOOP.`, cnt: 0},
  {abap: `LOOP AT tab INTO row.
  DELETE tab INDEX lv_index.
ENDLOOP.`, cnt: 0},
  {abap: `LOOP AT tab INTO row.
ENDLOOP.
DELETE tab INDEX sy-tabix.`, cnt: 0},
  {abap: `LOOP AT tab INTO row.
  DELETE TABLE tab FROM row.
ENDLOOP.`, cnt: 0},
  {abap: `LOOP AT tab INTO row.
  DELETE ADJACENT DUPLICATES FROM tab.
ENDLOOP.`, cnt: 0},
  {abap: `LOOP AT tab INTO row.
  DELETE tab.
ENDLOOP.`, cnt: 0},
];

testRule(tests, DeleteIndexInLoop);
