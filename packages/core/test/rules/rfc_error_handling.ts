import {RFCErrorHandling} from "../../src/rules/rfc_error_handling";
import {testRule} from "./_utils";
import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";

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

  // STARTING NEW TASK without DESTINATION is an asynchronous RFC to the destination NONE
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK'.`, cnt: 1},
  {abap: `CALL FUNCTION 'ABAP4_CALL_TRANSACTION' STARTING NEW TASK 'GIT'
      EXPORTING
        tcode                   = 'SE91'
      EXCEPTIONS
        call_transaction_denied = 1
        tcode_invalid           = 2
        OTHERS                  = 3.`, cnt: 1},
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK'
      CALLING on_end ON END OF TASK
      EXCEPTIONS
        system_failure        = 1 MESSAGE lv_msg
        communication_failure = 2 MESSAGE lv_msg
        OTHERS                = 3.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK'
      EXCEPTIONS
        system_failure        = 1
        communication_failure = 2.`, cnt: 0},

  // transactional RFC cannot have EXCEPTIONS
  {abap: `CALL FUNCTION 'MOO' IN BACKGROUND TASK DESTINATION 'BAR' EXPORTING foo = bar.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO' IN BACKGROUND TASK AS SEPARATE UNIT DESTINATION lv_dest.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO' IN BACKGROUND TASK.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO' IN UPDATE TASK EXPORTING foo = bar.`, cnt: 0},

  // error_message is ignored in RFC
  {abap: `CALL FUNCTION 'MOO' DESTINATION lv_dest
      EXCEPTIONS
        system_failure        = 1 MESSAGE lv_msg
        communication_failure = 2 MESSAGE lv_msg
        error_message         = 3
        OTHERS                = 4.`, cnt: 1},
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK'
      EXCEPTIONS
        system_failure        = 1 MESSAGE lv_msg
        communication_failure = 2 MESSAGE lv_msg
        ERROR_MESSAGE         = 3.`, cnt: 1},
  {abap: `CALL FUNCTION lv_fm_name
      DESTINATION mv_destination
      EXCEPTIONS
        error_message = 2
        OTHERS        = 1.`, cnt: 2},
  {abap: `CALL FUNCTION 'MOO'
      EXCEPTIONS
        error_message = 1
        OTHERS        = 2.`, cnt: 0},
];

testRule(tests, RFCErrorHandling);

const startingOff = [
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK'.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK' DESTINATION 'BAR'.`, cnt: 1},
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK' EXCEPTIONS error_message = 1.`, cnt: 0},
];

testRule(startingOff, RFCErrorHandling, {startingNewTask: false}, "rfc_error_handling, startingNewTask false");

const errorMessageOff = [
  {abap: `CALL FUNCTION 'MOO' DESTINATION lv_dest
      EXCEPTIONS
        system_failure        = 1 MESSAGE lv_msg
        communication_failure = 2 MESSAGE lv_msg
        error_message         = 3.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO' DESTINATION lv_dest
      EXCEPTIONS
        error_message         = 3.`, cnt: 1},
];

testRule(errorMessageOff, RFCErrorHandling, {errorMessage: false}, "rfc_error_handling, errorMessage false");

const requireMessage = [
  {abap: `CALL FUNCTION 'MOO' DESTINATION 'BAR'
      EXCEPTIONS
        system_failure        = 1 MESSAGE lv_msg
        communication_failure = 2 MESSAGE lv_msg
        OTHERS                = 3.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO' DESTINATION 'BAR'
      EXCEPTIONS
        system_failure        = 1
        communication_failure = 2 MESSAGE lv_msg.`, cnt: 1},
  {abap: `CALL FUNCTION 'MOO' DESTINATION 'BAR'
      EXCEPTIONS
        system_failure        = 1
        communication_failure = 2.`, cnt: 2},
  {abap: `CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK' DESTINATION IN GROUP DEFAULT
      EXCEPTIONS
        system_failure        = 1 MESSAGE lv_msg
        communication_failure = 2 MESSAGE lv_msg
        resource_failure      = 3.`, cnt: 0},
  {abap: `CALL FUNCTION 'MOO'
      EXCEPTIONS
        system_failure        = 1
        communication_failure = 2.`, cnt: 0},
];

testRule(requireMessage, RFCErrorHandling, {requireMessage: true}, "rfc_error_handling, requireMessage");


describe("Rule: rfc_error_handling, messages and positions", () => {
  function findIssues(abap: string) {
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
    const rule = new RFCErrorHandling();
    return rule.initialize(reg).run(reg.getFirstObject()!);
  }

  it("error_message, issue on the exception, says what to use instead", () => {
    const issues = findIssues(`CALL FUNCTION 'MOO' DESTINATION lv_dest
  EXCEPTIONS
    system_failure        = 1 MESSAGE lv_msg
    communication_failure = 2 MESSAGE lv_msg
    error_message         = 3.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(5);
    expect(issues[0].getMessage()).to.contain("system_failure = n MESSAGE msg");
  });

  it("STARTING NEW TASK without DESTINATION, issue on the statement", () => {
    const issues = findIssues(`CALL FUNCTION 'MOO' STARTING NEW TASK 'TASK'.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(1);
    expect(issues[0].getMessage()).to.contain("SYSTEM_FAILURE, COMMUNICATION_FAILURE");
    expect(issues[0].getMessage()).to.not.contain("RESOURCE_FAILURE");
  });
});
