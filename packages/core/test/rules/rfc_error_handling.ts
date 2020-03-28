import {RFCErrorHandling} from "../../src/rules/rfc_error_handling";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CALL FUNCTION 'MOO'.", cnt: 0},
  {abap: "CALL FUNCTION 'MOO' DESTINATION 'BAR'.", cnt: 1},
  {abap: `CALL FUNCTION 'MOO' DESTINATION 'BAR'
      EXCEPTIONS
        system_failure        = 1 MESSAGE lv_msg
        communication_failure = 2 MESSAGE lv_msg
        resource_failure      = 3.`, cnt: 0},

  {abap: `CALL FUNCTION 'MOO' DESTINATION 'BAR'
      EXCEPTIONS
        mooo        = 1 MESSAGE lv_msg
        communication_failure = 2 MESSAGE lv_msg
        resource_failure      = 3.`, cnt: 1},
];

testRule(tests, RFCErrorHandling);