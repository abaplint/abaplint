import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class NoAliasesConf extends BasicRuleConfig {
}

export class NoAliases extends ABAPRule {
  private conf = new NoAliasesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_aliases",
      title: "No ALIASES",
      shortDescription: `Detects use of the ALIAS statement`,
      tags: [RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoAliasesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const message = "Do not use ALIASES";
    for (const classDef of file.getInfo().listClassDefinitions()) {
      for (const alias of classDef.aliases) {
        issues.push(Issue.atIdentifier(alias.identifier, message, this.getMetadata().key, this.conf.severity));
      }
    }

    for (const interfaceDef of file.getInfo().listInterfaceDefinitions()) {
      for (const alias of interfaceDef.aliases) {
        issues.push(Issue.atIdentifier(alias.identifier, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}
