import {testRule} from "./_utils";
import {LocalClassNaming, LocalClassNamingConf} from "../../src/rules";

const requiredPatternTests = [
  {abap: "parser error", cnt: 0},
  {abap: "class ltcl_mockup_loader_mock definition final for testing.\n" +
    "endclass.", cnt: 0},
  {abap: "class lcl_helper final.\n" +
    "endclass.", cnt: 0},
  {abap: "class hello_world definition final for testing.\n" +
    "endclass.", cnt: 1},
  {abap: "class hello_world definition final.\n" +
    "endclass.", cnt: 1},
];

testRule(requiredPatternTests, LocalClassNaming);

const forbiddenPatternTests = [
  {abap: "class ltcl_mockup_loader_mock definition final for testing.\n" +
    "endclass.", cnt: 1},
  {abap: "class lcl_helper definition final.\n" +
    "endclass.", cnt: 1},
  {abap: "class hello_world definition final for testing.\n" +
    "endclass.", cnt: 0},
  {abap: "class hello_world definition final.\n" +
    "endclass.", cnt: 0},
];
const config = new LocalClassNamingConf();
config.local = "^lcl_.*$";
config.test = "^ltcl_.*$";
config.patternKind = "forbidden";
testRule(forbiddenPatternTests, LocalClassNaming, config);