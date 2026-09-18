import {testRule, testRuleFix} from "./_utils";
import {PreferAbapBool} from "../../src/rules";

const tests = [
  // negative cases
  {abap: `DATA foo TYPE i.`, cnt: 0},
  {abap: `DATA foo TYPE abap_bool.`, cnt: 0},
  {abap: `DATA foo TYPE string.`, cnt: 0},
  {abap: `DATA foo LIKE bar.`, cnt: 0},
  // XFELD
  {abap: `DATA foo TYPE xfeld.`, cnt: 1},
  {abap: `DATA foo TYPE XFELD.`, cnt: 1},
  // SAP_BOOL
  {abap: `DATA foo TYPE sap_bool.`, cnt: 1},
  {abap: `CLASS lcl DEFINITION. PUBLIC SECTION. CLASS-DATA foo TYPE sap_bool. ENDCLASS. CLASS lcl IMPLEMENTATION. ENDCLASS.`, cnt: 1},
  // BOOLE_D
  {abap: `DATA foo TYPE boole_d.`, cnt: 1},
  // FLAG
  {abap: `DATA foo TYPE flag.`, cnt: 1},
  // CONSTANTS
  {abap: `CONSTANTS c_true TYPE xfeld VALUE 'X'.`, cnt: 1},
  {abap: `CONSTANTS c_true TYPE abap_bool VALUE abap_true.`, cnt: 0},
  // TYPES
  {abap: `TYPES ty_bool TYPE xfeld.`, cnt: 1},
  {abap: `TYPES ty_bool TYPE abap_bool.`, cnt: 0},
  // FIELD-SYMBOLS
  {abap: `FIELD-SYMBOLS <fs> TYPE xfeld.`, cnt: 1},
  {abap: `FIELD-SYMBOLS <fs> TYPE abap_bool.`, cnt: 0},
  {abap: `FIELD-SYMBOLS <fs> TYPE flag.`, cnt: 1},
];

testRule(tests, PreferAbapBool);

const fixTests = [
  {input: `DATA foo TYPE xfeld.`, output: `DATA foo TYPE abap_bool.`},
  {input: `DATA foo TYPE XFELD.`, output: `DATA foo TYPE abap_bool.`},
  {input: `CLASS lcl DEFINITION. PUBLIC SECTION. CLASS-DATA foo TYPE sap_bool. ENDCLASS. CLASS lcl IMPLEMENTATION. ENDCLASS.`, output: `CLASS lcl DEFINITION. PUBLIC SECTION. CLASS-DATA foo TYPE abap_bool. ENDCLASS. CLASS lcl IMPLEMENTATION. ENDCLASS.`},
  {input: `CONSTANTS c TYPE boole_d VALUE 'X'.`, output: `CONSTANTS c TYPE abap_bool VALUE 'X'.`},
  {input: `TYPES ty TYPE flag.`, output: `TYPES ty TYPE abap_bool.`},
  {input: `FIELD-SYMBOLS <fs> TYPE xfeld.`, output: `FIELD-SYMBOLS <fs> TYPE abap_bool.`},
];

testRuleFix(fixTests, PreferAbapBool);
