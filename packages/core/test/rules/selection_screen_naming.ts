import {testRule} from "./_utils";
import {SelectionScreenNaming, SelectionScreenNamingConf} from "../../src/rules/selection_screen_naming";


const requiredPatternTests = [
  {abap: "parameters p_mat TYPE matnr.", cnt: 0},
  {abap: "parameters mat TYPE matnr.", cnt: 1},
  {abap: "parameters s_mat TYPE matnr.", cnt: 1},
  {abap: "select-options s_mat for gv_matnr.", cnt: 0},
  {abap: "select-options mat for gv_matnr.", cnt: 1},
  {abap: "select-options p_mat for gv_matnr.", cnt: 1},
];

const configRequired = new SelectionScreenNamingConf();
configRequired.parameter = "^P_.+$";
configRequired.selectOption = "^S_.+$";
configRequired.patternKind = "required";
testRule(requiredPatternTests, SelectionScreenNaming, configRequired);

const forbiddenPatternTests = [
  {abap: "parameters p_mat TYPE matnr.", cnt: 1},
  {abap: "parameters mat TYPE matnr.", cnt: 0},
  {abap: "parameters s_mat TYPE matnr.", cnt: 0},
  {abap: "select-options s_mat for gv_matnr.", cnt: 1},
  {abap: "select-options mat for gv_matnr.", cnt: 0},
  {abap: "select-options p_mat for gv_matnr.", cnt: 0},
];

const configForbidden = new SelectionScreenNamingConf();
configForbidden.parameter = "^P_.+$";
configForbidden.selectOption = "^S_.+$";
configForbidden.patternKind = "forbidden";
testRule(forbiddenPatternTests, SelectionScreenNaming, configForbidden);

const regexEmptyPatternTests = [
  {abap: "parameters p_mat TYPE matnr.", cnt: 0},
  {abap: "parameters mat TYPE matnr.", cnt: 0},
  {abap: "parameters s_mat TYPE matnr.", cnt: 0},
  {abap: "select-options s_mat for gv_matnr.", cnt: 0},
  {abap: "select-options mat for gv_matnr.", cnt: 0},
  {abap: "select-options p_mat for gv_matnr.", cnt: 0},
];

const configEmpty = new SelectionScreenNamingConf();
configEmpty.parameter = "";
configEmpty.selectOption = "";
configEmpty.patternKind = "required";
testRule(regexEmptyPatternTests, SelectionScreenNaming, configEmpty);