import {Issue} from "../issue";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class SyModificationConf extends BasicRuleConfig {
}

export class SyModification extends ABAPRule {

  private conf = new SyModificationConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "sy_modification",
      title: "Modification of SY fields",
      shortDescription: `Finds modification of sy fields`,
      extendedInformation: ``,
      tags: [RuleTag.SingleFile],
      badExample: `
sy-uname = 2.
sy = sy.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SyModificationConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const t of file.getStructure()?.findAllExpressions(Expressions.Target) || []) {
      const firstChild = t.getChildren()[0];
      if (firstChild.get() instanceof Expressions.TargetField
          && firstChild.getFirstToken().getStr().toUpperCase() === "SY") {

        const message = "Modification of SY field";
        const issue = Issue.atToken(file, firstChild.getFirstToken(), message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

}