import {RFCErrorHandling} from "../../src/rules/rfc_error_handling";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CALL FUNCTION 'MOO'.", cnt: 0},
  {abap: "CALL FUNCTION 'MOO' DESTINATION 'BAR'.", cnt: 1},
  {abap: `CALL FUNCTION 'Z_ABAPGIT_SERIALIZE_PACKAGE' DESTINATION lv_dest
      EXCEPTIONS
        system_failure = 1 MESSAGE lv_msg
        communication_failure = 2 MESSAGE lv_msg
        OTHERS = 3.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO' DESTINATION 'BAR'
      EXCEPTIONS
        system_failure = 1
        communication_failure = 2.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO' DESTINATION 'BAR'
      EXCEPTIONS system_failure = 1.`, cnt: 1},
  {abap: `CALL FUNCTION 'MOO' DESTINATION 'BAR'
      EXCEPTIONS communication_failure = 1.`, cnt: 1},
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK' DESTINATION 'BAR'
      EXCEPTIONS
        system_failure = 1
        communication_failure = 2.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK' DESTINATION IN GROUP DEFAULT
      EXCEPTIONS
        system_failure = 1
        communication_failure = 2.`, cnt: 1},
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK' DESTINATION IN GROUP DEFAULT
      EXCEPTIONS
        system_failure = 1
        communication_failure = 2
        resource_failure = 3.`, cnt: 0},
  {abap: `call function 'MOO' starting new task 'TASK' destination in group lv_group
      exceptions
        system_failure = 1
        communication_failure = 2
        resource_failure = 3.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK' DESTINATION IN GROUP lv_group
      EXCEPTIONS
        system_failure = 1
        communication_failure = 2.`, cnt: 1},
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK' DESTINATION IN GROUP DEFAULT.`, cnt: 1},
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
