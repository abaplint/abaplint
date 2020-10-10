import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Issue, Statements} from "..";
import {IRuleMetadata, RuleTag} from "./_irule";

export class CallTransactionAuthorityCheckConf extends BasicRuleConfig {
}
export class CallTransactionAuthorityCheck extends ABAPRule {

  private conf = new CallTransactionAuthorityCheckConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "call_transaction_authority_check",
      title: "Call Transaction Authority-Check",
      shortDescription: `Checks that usages of CALL TRANSACTION contain an authority-check.`,
      extendedInformation: `https://docs.abapopenchecks.org/checks/54/`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
      badExample: `CALL TRANSACTION 'FOO'.`,
      goodExample: `CALL TRANSACTION 'FOO' WITH AUTHORITY-CHECK.`,
    };
  }

  private getMessage(): string {
    return "Add an authority check to CALL TRANSACTION";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CallTransactionAuthorityCheckConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statNode of file.getStatements()) {
      const statement = statNode.get();
      if (statement instanceof Statements.CallTransaction && !statNode.concatTokensWithoutStringsAndComments().toUpperCase().includes("WITH AUTHORITY-CHECK")) {
        issues.push(Issue.atStatement(file, statNode, this.getMessage(), this.getMetadata().key));
      }
    }
    return issues;
  }

}