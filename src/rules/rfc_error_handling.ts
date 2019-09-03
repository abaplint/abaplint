import {Issue} from "../issue";
// import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/statements/";
import * as Expressions from "../abap/expressions/";

/** Checks that exceptions 'system_failure' and 'communication_failure' are handled in RFC calls */
export class RFCErrorHandlingConf extends BasicRuleConfig {
}

export class RFCErrorHandling extends ABAPRule {
  private conf = new RFCErrorHandlingConf();

  public getKey(): string {
    return "rfc_error_handling";
  }

  public getDescription(): string {
    return "RFC error handling";
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
        output.push(new Issue({file, message: this.getDescription(), key: this.getKey(), start: token.getStart()}));
        continue;
      }

      const parameters = list.findAllExpressions(Expressions.ParameterName);
      const names: String[] = [];
      for (const par of parameters) {
        names.push(par.getFirstToken().getStr().toUpperCase());
      }

      if (names.indexOf("SYSTEM_FAILURE") < 0
          || names.indexOf("COMMUNICATION_FAILURE") < 0
          || names.indexOf("RESOURCE_FAILURE") < 0) {
        output.push(new Issue({file, message: this.getDescription(), key: this.getKey(), start: token.getStart()}));
        continue;
      }
    }

    return output;
  }

}