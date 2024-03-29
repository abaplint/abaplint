import {LineBreakMultipleParameters, LineBreakMultipleParametersConf} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: `parser error`, cnt: 0},
  {abap: `method( parameter1 = value parameter2 = value ).`, cnt: 1},
  {abap: `method( par1 = value par2 = value par3 = value ).`, cnt: 2},
  {abap: `method( parameter1 = value\n parameter2 = value ).`, cnt: 0},
  {abap: `foo = NEW lcl_bar( parameter1 = value parameter2 = value ).`, cnt: 1},
  {abap: `
DEFINE my_macro.
  cl_msg=>print(
    msgv1 = &1
    msgv2 = &2
    msgv3 = &3
    msgv4 = &4 ).
END-OF-DEFINITION.
my_macro 'This' 'is' 'test' 'message'.`, cnt: 0},
];

testRule(tests, LineBreakMultipleParameters);

const fixTests = [
  {input: `method( para1 = value para2 = value ).`,
    output: "method( para1 = value \n        para2 = value )."},
];
testRuleFix(fixTests, LineBreakMultipleParameters);

const config = new LineBreakMultipleParametersConf();
config.count = 2;

const tests2 = [
  {abap: `method( parameter1 = value parameter2 = value ).`, cnt: 0},
  {abap: `method( par1 = val par2 = value par3 = value ).`, cnt: 1},
  {abap: `method( par1 = value\n par2 = value par3 = value ).`, cnt: 1},
];
testRule(tests2, LineBreakMultipleParameters, config);