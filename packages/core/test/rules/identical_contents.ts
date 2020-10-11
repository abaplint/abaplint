import {IdenticalContents} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "sdfsdfds.", cnt: 0},

  {abap: `
  IF lv_foo = lv_bar.
    lv_moo = abap_true.
    WRITE / lv_moo.
  ELSE.
    lv_moo = abap_true.
  ENDIF.`, cnt: 1},

  {abap: `
  lv_moo = abap_true.
  IF lv_foo = lv_bar.
    WRITE / lv_moo.
  ENDIF.`, cnt: 0},

  {abap: `
  IF lv_foo = lv_bar.
    WRITE / lv_moo.
    lv_moo = abap_true.
  ELSE.
    lv_moo = abap_true.
  ENDIF.`, cnt: 1},

  {abap: `
  IF lv_foo = lv_bar.
    WRITE: / lv_moo.
    lv_moo = abap_true.
  ELSEIF lv_moo = lv_boo.
    lv_moo = abap_false.
  ENDIF.`, cnt: 0},

  {abap: `
  IF lv_foo = lv_bar.
    WRITE / lv_moo.
    IF 1 = 2.
      WRITE / lv_text.
    ENDIF.
  ELSE.
    IF 1 = 2.
      WRITE / lv_bar.
    ENDIF.
  ENDIF.`, cnt: 0},

  {abap: `
    IF 1 = 2.
      WRITE / lv_text.
    ENDIF.
    IF 1 = 2.
      WRITE / lv_bar.
    ENDIF.`, cnt: 0},

  {abap: `
  IF 1 = 2.
    WRITE / lv_text.
  ENDIF.
  IF 1 = 2.
    WRITE / lv_bar.
  ELSE.
    WRITE / lv_bar.
  ENDIF.`, cnt: 1},

  {abap: `
  IF lv_a = lv_b.
    lv_foo = lv_bar.
  ELSE.
    IF lv_c = '12'.
      lv_foo = lv_bar.
    ELSE.
      lv_foo = lv_bar.
    ENDIF.
  ENDIF.`, cnt: 1},

  {abap: `
  IF NOT mooo IS INITIAL.
    CLEAR diadr.
    IF sy-subrc <> 0.
      WRITE ''hello''.
    ELSEIF 3 = 2.
      WRITE ''world''.
    ELSE.
      MOVE foo TO bar.
    ENDIF.
  ELSE.
    CLEAR moo.
  ENDIF.`, cnt: 0},

  {abap: `
  IF p_obje = abap_true.
    WRITE: / 'Found', lv_lines, 'dependencies for', p_type, p_name.
  ELSE.
    WRITE: / 'Found', lv_lines, 'dependencies for the following packages:'.
    LOOP AT lt_packages INTO lv_package.
      WRITE: AT /5 lv_package.
    ENDLOOP.
  ENDIF.`, cnt: 0},

];

testRule(tests, IdenticalContents);