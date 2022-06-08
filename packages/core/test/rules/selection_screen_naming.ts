import {testRule} from "./_utils";
import {SelectionScreenNaming, SelectionScreenNamingConf} from "../../src/rules/selection_screen_naming";


const requiredPatternTests = [
  {abap: "parameters p_mat TYPE matnr.", cnt: 0},
  {abap: "parameters mat TYPE matnr.", cnt: 1},
  {abap: "parameters s_mat TYPE matnr.", cnt: 1},
  {abap: "select-options s_mat for gv_matnr.", cnt: 0},
  {abap: "select-options mat for gv_matnr.", cnt: 1},
  {abap: "select-options p_mat for gv_matnr.", cnt: 1},
  {abap: "selection-screen comment (20) sc_cmmnt.", cnt: 0},
  {abap: "selection-screen comment (20) cmmnt.", cnt: 1},
  {abap: "selection-screen pushbutton (20) sc_buttn user-command cmd.", cnt: 0},
  {abap: "selection-screen pushbutton (20) button user-command cmd.", cnt: 1},
  {abap: "selection-screen begin of block b1 with frame title sc_title.", cnt: 0},
  {abap: "selection-screen begin of block b1 with frame title head.", cnt: 1},
  {abap: "selection-screen begin of tabbed block sc_block for 10 lines.", cnt: 0},
  {abap: "selection-screen begin of tabbed block b1 for 10 lines.", cnt: 1},
  {abap: "selection-screen tab (40) sc_tab user-command cmd default screen 200.", cnt: 0},
  {abap: "selection-screen tab (40) about user-command cmd default screen 200.", cnt: 1},
];

const configRequired = new SelectionScreenNamingConf();
configRequired.parameter = "^P_.+$";
configRequired.selectOption = "^S_.+$";
configRequired.screenElement = "^SC_.+$";
configRequired.patternKind = "required";
testRule(requiredPatternTests, SelectionScreenNaming, configRequired);

const forbiddenPatternTests = [
  {abap: "parameters p_mat TYPE matnr.", cnt: 1},
  {abap: "parameters mat TYPE matnr.", cnt: 0},
  {abap: "parameters s_mat TYPE matnr.", cnt: 0},
  {abap: "select-options s_mat for gv_matnr.", cnt: 1},
  {abap: "select-options mat for gv_matnr.", cnt: 0},
  {abap: "select-options p_mat for gv_matnr.", cnt: 0},
  {abap: "selection-screen comment (20) sc_cmmnt.", cnt: 1},
  {abap: "selection-screen comment (20) cmmnt.", cnt: 0},
  {abap: "selection-screen pushbutton (20) sc_buttn user-command cmd.", cnt: 1},
  {abap: "selection-screen pushbutton (20) button user-command cmd.", cnt: 0},
  {abap: "selection-screen begin of block b1 with frame title sc_title.", cnt: 1},
  {abap: "selection-screen begin of block b1 with frame title head.", cnt: 0},
  {abap: "selection-screen begin of tabbed block sc_block for 10 lines.", cnt: 1},
  {abap: "selection-screen begin of tabbed block b1 for 10 lines.", cnt: 0},
  {abap: "selection-screen tab (40) sc_tab user-command cmd default screen 200.", cnt: 1},
  {abap: "selection-screen tab (40) about user-command cmd default screen 200.", cnt: 0},
];

const configForbidden = new SelectionScreenNamingConf();
configForbidden.parameter = "^P_.+$";
configForbidden.selectOption = "^S_.+$";
configForbidden.screenElement = "^SC_.+$";
configForbidden.patternKind = "forbidden";
testRule(forbiddenPatternTests, SelectionScreenNaming, configForbidden);

const regexEmptyPatternTests = [
  {abap: "parameters p_mat TYPE matnr.", cnt: 0},
  {abap: "parameters mat TYPE matnr.", cnt: 0},
  {abap: "parameters s_mat TYPE matnr.", cnt: 0},
  {abap: "select-options s_mat for gv_matnr.", cnt: 0},
  {abap: "select-options mat for gv_matnr.", cnt: 0},
  {abap: "select-options p_mat for gv_matnr.", cnt: 0},
  {abap: "selection-screen comment (20) sc_cmmnt.", cnt: 0},
  {abap: "selection-screen comment (20) cmmnt.", cnt: 0},
  {abap: "selection-screen pushbutton (20) sc_buttn user-command cmd.", cnt: 0},
  {abap: "selection-screen pushbutton (20) button user-command cmd.", cnt: 0},
  {abap: "selection-screen begin of block b1 with frame title sc_title.", cnt: 0},
  {abap: "selection-screen begin of block b1 with frame title head.", cnt: 0},
  {abap: "selection-screen begin of tabbed block sc_block for 10 lines.", cnt: 0},
  {abap: "selection-screen begin of tabbed block b1 for 10 lines.", cnt: 0},
  {abap: "selection-screen tab (40) sc_tab user-command cmd default screen 200.", cnt: 0},
  {abap: "selection-screen tab (40) about user-command cmd default screen 200.", cnt: 0},
];

const configEmpty = new SelectionScreenNamingConf();
configEmpty.parameter = "";
configEmpty.selectOption = "";
configEmpty.screenElement = "";
configEmpty.patternKind = "required";
testRule(regexEmptyPatternTests, SelectionScreenNaming, configEmpty);