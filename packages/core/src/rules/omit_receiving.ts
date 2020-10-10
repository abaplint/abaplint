import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
// import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../abap/abap_file";

export class OmitReceivingConf extends BasicRuleConfig {
}

export class OmitReceiving extends ABAPRule {
  private conf = new OmitReceivingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "omit_receiving",
      title: "Omit RECEIVING",
      shortDescription: `Omit RECEIVING`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#omit-receiving`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: OmitReceivingConf) {
    this.conf = conf;
  }

  public runParsed(_file: ABAPFile) {
    const issues: Issue[] = [];

    return issues;
  }

}