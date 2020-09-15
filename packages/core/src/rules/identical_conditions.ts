import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {IRuleMetadata} from "./_irule";

export class IdenticalConditionsConf extends BasicRuleConfig {
}

export class IdenticalConditions extends ABAPRule {
  private conf = new IdenticalConditionsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "identical_conditions",
      title: "Identical conditions",
      shortDescription: `Find identical conditions in IF + CASE + WHILE etc`,
      tags: [],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IdenticalConditionsConf) {
    this.conf = conf;
  }

  public runParsed(_file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    return issues;
  }
}