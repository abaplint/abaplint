import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import * as Statements from "../abap/2_statements/statements";
import {ABAPFile} from "../abap/abap_file";
import {Issue} from "../issue";
import {ABAPObject} from "../objects/_abap_object";
import {Version} from "../version";

export class CallTransactionAuthorityCheckConf extends BasicRuleConfig {
}
export class CallTransactionAuthorityCheck extends ABAPRule {

  private conf = new CallTransactionAuthorityCheckConf();
  private readonly MINIMUM_VERSION = Version.v740sp02;

  public getMetadata(): IRuleMetadata {
    return {
      key: "call_transaction_authority_check",
      title: "Call Transaction Authority-Check",
      shortDescription: `Checks that usages of CALL TRANSACTION contain an authority-check.`,
      extendedInformation: `https://docs.abapopenchecks.org/checks/54/`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile, RuleTag.Security],
      badExample: `CALL TRANSACTION 'FOO'.`,
      goodExample: `TRY.
    CALL TRANSACTION 'FOO' WITH AUTHORITY-CHECK.
  CATCH cx_sy_authorization_error.
ENDTRY.`,
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

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const currentVersion = this.reg.getConfig().getVersion();
    // Cloud version does not support CALL TRANSACTION
    if (currentVersion < this.MINIMUM_VERSION || currentVersion === Version.Cloud) {
      return [];
    }
    const issues: Issue[] = [];

    if (obj.getType() === "INTF") {
      return [];
    }

    for (const statNode of file.getStatements()) {
      const statement = statNode.get();
      if (statement instanceof Statements.CallTransaction && !statNode.concatTokensWithoutStringsAndComments().toUpperCase().includes("WITH AUTHORITY-CHECK")) {
        issues.push(Issue.atStatement(file, statNode, this.getMessage(), this.getMetadata().key));
      }
    }
    return issues;
  }

}