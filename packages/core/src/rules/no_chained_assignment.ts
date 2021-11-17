// import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
// import {ExpressionNode} from "../abap/nodes";

export class NoChainedAssignmentConf extends BasicRuleConfig {
  public onlyConstants: boolean = false;
}

export class NoChainedAssignment extends ABAPRule {

  private conf = new NoChainedAssignmentConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_chained_assignment",
      title: "No chained assignemtn",
      shortDescription: `Find chained assingments and reports issues`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#dont-chain-assignments`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide],
      badExample: `var1 = var2 = var3..`,
      goodExample: `var2 = var3.
var1 = var3.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoChainedAssignmentConf) {
    this.conf = conf;
  }

  public runParsed(_file: ABAPFile) {
    const issues: Issue[] = [];

// todo

    return issues;
  }

}
