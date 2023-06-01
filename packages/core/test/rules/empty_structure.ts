import {EmptyStructure} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CHECK foo = bar.", cnt: 0},
  {abap: "LOOP AT foobar.\nENDLOOP.", cnt: 1},
  {abap: "LOOP AT foobar.\nWRITE boo.\nENDLOOP.", cnt: 0},
  {abap: "IF foo = bar.\nENDIF.", cnt: 1},
  {abap: "WHILE foo = bar.\nENDWHILE.", cnt: 1},
  {abap: "CASE foo.\nENDCASE.", cnt: 1},

  {abap: `
TRY.
  CATCH cx_errror INTO something.
ENDTRY.`, cnt: 1},

  {abap: `
TRY.
    WRITE bar.
  CATCH cx_errror INTO something.
ENDTRY.`, cnt: 0},

  {abap: `
IF sy-subrc <> 0.
ELSE.
  WRITE 'a'.
ENDIF.`, cnt: 1},

  {abap: `
IF sy-subrc <> 0.
  WRITE 'a'.
ELSE.
ENDIF.`, cnt: 1},

  {abap: `
IF sy-subrc <> 0.
  WRITE 'a'.
ELSEIF 1 = 2.
ENDIF.`, cnt: 1},

// nested,
  {abap: `
IF sy-subrc <> 0.
  WRITE 'a'.
ELSEIF 1 = 2.
  IF 'a' = 'B'.
  ENDIF.
ENDIF.`, cnt: 1},

  {abap: `
CASE foo.
  WHEN 'a'.
    WRITE 'bar'.
ENDCASE.`, cnt: 0},
  {abap: `
CASE foo.
  WHEN 'a'.
ENDCASE.`, cnt: 1},
  {abap: `
CASE foo.
  WHEN OTHERS.
ENDCASE.`, cnt: 1},

// nested,
  {abap: `
DATA bar TYPE i.
CASE bar.
  WHEN 1.
    CASE bar.
      WHEN '00' OR '10'.
      WHEN '01'.
      WHEN '11'.
      WHEN OTHERS.
    ENDCASE.
  WHEN OTHERS.
    ASSERT 1 = 'todo'.
ENDCASE.`, cnt: 4},

];

testRule(tests, EmptyStructure);