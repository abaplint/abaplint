import {EmptyStructure, EmptyStructureConf} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CHECK foo = bar.", cnt: 0},
  {abap: "LOOP AT foobar.\nENDLOOP.", cnt: 1},
  {abap: "LOOP AT foobar.\nWRITE boo.\nENDLOOP.", cnt: 0},
  {abap: "IF foo = bar.\nENDIF.", cnt: 1},
  {abap: "WHILE foo = bar.\nENDWHILE.", cnt: 1},
  {abap: "WHILE foo = bar.\nWHILE foo = bar.\nENDWHILE.\nENDWHILE.", cnt: 1},
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

// with syntax error
  {abap: `LOOP AT foobar.
  sdfsddfs.
  ENDLOOP.`, cnt: 0},

  {abap: `LOOP AT itab WHERE qty = 0 OR date > sy-datum.
ENDLOOP.
result = xsdbool( sy-subrc = 0 ).`, cnt: 0},

];

testRule(tests, EmptyStructure);

const catchTests = [
  // empty CATCH, as measured on a 7.58 system: SLIN "No exception handling after the CATCH statement" (UNR 0245)
  {abap: `TRY.
    WRITE 'a'.
  CATCH cx_root.
ENDTRY.`, cnt: 1}, // C1 empty CATCH
  {abap: `TRY.
    WRITE 'a'.
  CATCH cx_root ##NO_HANDLER.
ENDTRY.`, cnt: 0}, // C2 pragma
  {abap: `TRY.
    WRITE 'a'.
  CATCH cx_root. "#EC NO_HANDLER
ENDTRY.`, cnt: 0}, // C3 pseudo comment
  {abap: `TRY.
    WRITE 'a'.
  CATCH cx_root.
    " intentionally ignored
ENDTRY.`, cnt: 1}, // C4 only a comment
  {abap: `TRY.
    WRITE 'a'.
  CATCH cx_root INTO DATA(lx).
ENDTRY.`, cnt: 1}, // C5 INTO
  {abap: `TRY.
    WRITE 'a'.
  CATCH cx_sy_zerodivide cx_static_check.
ENDTRY.`, cnt: 1}, // C6 two classes
  {abap: `TRY.
    WRITE 'a'.
  CATCH BEFORE UNWIND cx_root.
ENDTRY.`, cnt: 1}, // C7 BEFORE UNWIND
  {abap: `TRY.
    WRITE 'a'.
  CATCH cx_static_check.
  CATCH cx_root.
    RETURN.
ENDTRY.`, cnt: 1}, // C8 first of two
  {abap: `TRY.
    WRITE 'a'.
  CATCH cx_root.
    RETURN.
  CLEANUP.
ENDTRY.`, cnt: 0}, // C9 empty CLEANUP
  {abap: `TRY.
    WRITE 'a'.
  CATCH cx_root.
    RETURN.
ENDTRY.`, cnt: 0}, // C10 not empty

];

const catchConfig = new EmptyStructureConf();
catchConfig.catch = true;
testRule(catchTests, EmptyStructure, catchConfig, "test empty_structure rule, catch");

// off by default
testRule([{abap: `TRY.
    WRITE 'a'.
  CATCH cx_root.
ENDTRY.`, cnt: 0}], EmptyStructure, undefined, "test empty_structure rule, catch off by default");
