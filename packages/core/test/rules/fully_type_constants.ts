import {FullyTypeConsantsConf, FullyTypeConstants} from "../../src/rules/fully_type_constants";
import {testRuleWithVariableConfig} from "./_utils";

const configOnlyConstants = new FullyTypeConsantsConf();
configOnlyConstants.checkData = false;

const configDataAndConstants = new FullyTypeConsantsConf();
configDataAndConstants.checkData = true;

const testCases: string[] = [
  `CONSTANTS: tested_name VALUE \`blah\`.`,
  `CONSTANTS: tested_name3 VALUE 1234.`,
  `DATA: foo VALUE 124.`,
  `DATA: foo VALUE \`blah\`.`,
  `CONSTANTS foo TYPE i VALUE 1.`,
  `DATA:
    foo TYPE i VALUE 1,
    bar TYPE REF TO lcl_foo,
    table TYPE TABLE OF mara.`,

  `CONSTANTS: BEGIN OF c_multi,
    foo VALUE 1,
    bar TYPE i VALUE 1,
   END OF c_multi.`,

  `DATA: BEGIN OF multi,
    foo VALUE 1,
    bar TYPE i VALUE 1,
  END OF multi.`,
];

const fullyTypeTests = [
  {
    abap: testCases[0],
    description: "only const, const string no type ",
    config: configOnlyConstants,
    issueLength: 1,
  },
  {
    abap: testCases[0],
    description: "both, const string no type",
    config: configDataAndConstants,
    issueLength: 1,
  },
  {
    abap: testCases[1],
    description: "only const, const number no type ",
    config: configOnlyConstants,
    issueLength: 1,
  },
  {
    abap: testCases[1],
    description: "both, const number no type",
    config: configDataAndConstants,
    issueLength: 1,
  },
  {
    abap: testCases[2],
    description: "only const, data number no type ",
    config: configOnlyConstants,
    issueLength: 0,
  },
  {
    abap: testCases[2],
    description: "both, data number no type",
    config: configDataAndConstants,
    issueLength: 1,
  },
  {
    abap: testCases[3],
    description: "only const, data string no type ",
    config: configOnlyConstants,
    issueLength: 0,
  },
  {
    abap: testCases[3],
    description: "both, data string no type",
    config: configDataAndConstants,
    issueLength: 1,
  },
  {
    abap: testCases[4],
    description: "only const, const with type",
    config: configOnlyConstants,
    issueLength: 0,
  },
  {
    abap: testCases[4],
    description: "both, const with type",
    config: configDataAndConstants,
    issueLength: 0,
  },
  {
    abap: testCases[5],
    description: "only const, data with various types",
    config: configOnlyConstants,
    issueLength: 0,
  },
  {
    abap: testCases[5],
    description: "both, data with various types",
    config: configDataAndConstants,
    issueLength: 0,
  },
  {
    abap: testCases[6],
    description: "only const, const struc, one not typed",
    config: configOnlyConstants,
    issueLength: 1,
  },
  {
    abap: testCases[6],
    description: "both, const struc, one not typed",
    config: configDataAndConstants,
    issueLength: 1,
  },
  {
    abap: testCases[7],
    description: "only const, data struc, one not typed",
    config: configOnlyConstants,
    issueLength: 0,
  },
  {
    abap: testCases[7],
    description: "both, data struc, one not typed",
    config: configDataAndConstants,
    issueLength: 1,
  },
];

testRuleWithVariableConfig(fullyTypeTests, FullyTypeConstants);