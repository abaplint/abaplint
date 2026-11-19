import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ExpressionNode} from "../abap/nodes";

export class RFCErrorHandlingConf extends BasicRuleConfig {
  /** Also check CALL FUNCTION ... STARTING NEW TASK without DESTINATION, an asynchronous RFC to the destination NONE */
  public startingNewTask: boolean = true;
  /** Report error_message in the EXCEPTIONS of an RFC call, it is ignored in RFC */
  public errorMessage: boolean = true;
  /** Report SYSTEM_FAILURE and COMMUNICATION_FAILURE without the addition MESSAGE, the error text is lost */
  public requireMessage: boolean = false;
}

export class RFCErrorHandling extends ABAPRule {
  private conf = new RFCErrorHandlingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "rfc_error_handling",
      title: "RFC error handling",
      tags: [RuleTag.SingleFile],
      shortDescription: `Checks that exceptions 'system_failure' and 'communication_failure' are handled in RFC calls`,
      extendedInformation: `RESOURCE_FAILURE is also required for asynchronous calls with DESTINATION IN GROUP.

Checked are CALL FUNCTION ... DESTINATION and, with startingNewTask, CALL FUNCTION ... STARTING NEW TASK
without DESTINATION, which is an asynchronous RFC to the destination NONE.
CALL FUNCTION ... IN BACKGROUND TASK is not checked, it cannot have EXCEPTIONS.

errorMessage: reports error_message in the EXCEPTIONS of an RFC call. It is ignored in RFC, a message of
type A, E or X ends the called function module and raises SYSTEM_FAILURE, use system_failure = n MESSAGE msg
to get the message text. Exception: with a DESTINATION that is blank at runtime, the call is local.

requireMessage: reports SYSTEM_FAILURE and COMMUNICATION_FAILURE without the addition MESSAGE.

https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenrfc_exception.html
https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapcall_function_destination_para.html`,
      badExample: `CALL FUNCTION 'ZRFC'
  DESTINATION lv_rfc.

CALL FUNCTION 'ZRFC'
  STARTING NEW TASK 'TASK'
  EXCEPTIONS
    error_message = 1
    OTHERS        = 2.`,
      goodExample: `CALL FUNCTION 'ZRFC'
  DESTINATION lv_rfc
  EXCEPTIONS
    system_failure        = 1 MESSAGE msg
    communication_failure = 2 MESSAGE msg
    OTHERS                = 3.

CALL FUNCTION 'ZRFC'
  STARTING NEW TASK 'TASK'
  EXCEPTIONS
    system_failure        = 1 MESSAGE msg
    communication_failure = 2 MESSAGE msg
    OTHERS                = 3.`,
    };
  }

  private getMessage(requireResourceFailure: boolean): string {
    return "RFC error handling: At least one unhandled exception from SYSTEM_FAILURE, COMMUNICATION_FAILURE"
      + (requireResourceFailure ? ", RESOURCE_FAILURE" : "");
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: RFCErrorHandlingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const output: Issue[] = [];

    for (const stat of file.getStatements()) {
      const token = stat.getFirstToken();

      if (!(stat.get() instanceof Statements.CallFunction)) {
        continue;
      }

      const destination = stat.findFirstExpression(Expressions.Destination);
      const starting = stat.findDirectTokenByText("STARTING") !== undefined;
      if (destination === undefined && (starting === false || this.conf.startingNewTask === false)) {
        continue;
      }
      if (stat.findDirectTokenByText("BACKGROUND") !== undefined) {
        // transactional RFC, it has no EXCEPTIONS
        continue;
      }

      const requireResourceFailure = starting === true
        && destination?.findDirectTokenByText("GROUP") !== undefined;
      const list = stat.findFirstExpression(Expressions.ParameterListExceptions);
      if (list === undefined) {
        const issue = Issue.atToken(file, token, this.getMessage(requireResourceFailure), this.getMetadata().key, this.conf.severity);
        output.push(issue);
        continue;
      }

      const exceptions = new Map<string, ExpressionNode>();
      for (const exception of list.findDirectExpressions(Expressions.ParameterException)) {
        exceptions.set(exception.getFirstToken().getStr().toUpperCase(), exception);
      }

      if (exceptions.has("SYSTEM_FAILURE") === false
          || exceptions.has("COMMUNICATION_FAILURE") === false
          || (requireResourceFailure && exceptions.has("RESOURCE_FAILURE") === false)) {
        const issue = Issue.atToken(file, token, this.getMessage(requireResourceFailure), this.getMetadata().key, this.conf.severity);
        output.push(issue);
      }

      const errorMessage = exceptions.get("ERROR_MESSAGE");
      if (this.conf.errorMessage !== false && errorMessage !== undefined) {
        const message = "error_message is ignored in RFC, messages of type A, E and X raise SYSTEM_FAILURE, use system_failure = n MESSAGE msg";
        output.push(Issue.atToken(file, errorMessage.getFirstToken(), message, this.getMetadata().key, this.conf.severity));
      }

      if (this.conf.requireMessage === true) {
        for (const name of ["SYSTEM_FAILURE", "COMMUNICATION_FAILURE"]) {
          const exception = exceptions.get(name);
          if (exception !== undefined && exception.findDirectTokenByText("MESSAGE") === undefined) {
            const message = `${name} without MESSAGE, the error text is lost, use ${name.toLowerCase()} = n MESSAGE msg`;
            output.push(Issue.atToken(file, exception.getFirstToken(), message, this.getMetadata().key, this.conf.severity));
          }
        }
      }
    }

    return output;
  }

}
