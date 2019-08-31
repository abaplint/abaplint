import {testRule} from "./_utils";
import {LocalClassNaming} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "class ltcl_mockup_loader_mock definition final for testing.\n" +
    "endclass.", cnt: 0},
  {abap: "class hello_world definition final for testing.\n" +
    "endclass.", cnt: 1},
];

testRule(tests, LocalClassNaming);