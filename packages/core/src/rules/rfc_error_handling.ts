import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";

export class RFCErrorHandlingConf extends BasicRuleConfig {
}

export class RFCErrorHandling extends ABAPRule {
  private conf = new RFCErrorHandlingConf();

  public getMetadata() {
    return {
      key: "rfc_error_handling",
      title: "RFC error handling",
      shortDescription: `Checks that exceptions 'system_failure' and 'communication_failure' are handled in RFC calls`,
      extendedInformation: `https://help.sap.com/doc/abapdocu_750_index_htm/7.50/en-US/abenrfc_exception.htm`,
    };
  }

  private getMessage(): string {
    return "RFC error handling: At least one unhandled exception from SYSTEM_FAILURE, COMMUNICATION_FAILURE, RESOURCE_FAILURE.";
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

      if (!stat.findFirstExpression(Expressions.Destination)) {
        continue;
      }

      const list = stat.findFirstExpression(Expressions.ParameterListExceptions);
      if (list === undefined) {
        const issue = Issue.atToken(file, token, this.getMessage(), this.getMetadata().key, this.conf.severity);
        output.push(issue);
        continue;
      }

      const parameters = list.findAllExpressions(Expressions.ParameterName);
      const names: string[] = [];
      for (const par of parameters) {
        names.push(par.getFirstToken().getStr().toUpperCase());
      }

      if (names.indexOf("SYSTEM_FAILURE") < 0
          || names.indexOf("COMMUNICATION_FAILURE") < 0
          || names.indexOf("RESOURCE_FAILURE") < 0) {
        const issue = Issue.atToken(file, token, this.getMessage(), this.getMetadata().key, this.conf.severity);
        output.push(issue);
        continue;
      }
    }

    return output;
  }

}