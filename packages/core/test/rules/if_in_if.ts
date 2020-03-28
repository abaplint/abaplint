import {IfInIf} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: `parser error`, cnt: 0},
  {abap: `IF foo = bar.
          ENDIF.`, cnt: 0},
  {abap: `IF foo = bar.
          ELSE.
          ENDIF.`, cnt: 0},
  {abap: `CHECK foo = bar.`, cnt: 0},
  {abap: `IF foo = bar.
            IF moo = boo.
            ENDIF.
          ENDIF.`, cnt: 1},
  {abap: `IF foo = bar.
            WRITE bar.
            IF moo = boo.
            ENDIF.
          ENDIF.`, cnt: 0},
  {abap: `IF foo = bar.
            IF moo = boo.
            ENDIF.
            WRITE bar.
          ENDIF.`, cnt: 0},
  {abap: `IF foo = bar.
          ELSE.
            IF moo = boo.
            ENDIF.
          ENDIF.`, cnt: 1},
  {abap: `IF foo = bar.
          ELSE.
            IF moo = boo.
            ELSE.
            ENDIF.
          ENDIF.`, cnt: 1},
  {abap: `IF foo = bar.
          ELSEIF moo = loo.
            IF moo = boo.
            ENDIF.
          ENDIF.`, cnt: 0},
  {abap: `IF foo = bar.
          ELSEIF moo = boo.
          ENDIF.`, cnt: 0},
];

testRule(tests, IfInIf);