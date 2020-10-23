import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {Version} from "../version";
import {EditHelper} from "../edit_helper";
import {ABAPFile} from "../abap/abap_file";

export class PreferXsdboolConf extends BasicRuleConfig {
}

export class PreferXsdbool extends ABAPRule {

  private conf = new PreferXsdboolConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_xsdbool",
      title: "Prefer xsdbool over boolc",
      shortDescription: `Prefer xsdbool over boolc`,
      extendedInformation: `
Activates if language version is v740sp08 or above.

https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#use-xsdbool-to-set-boolean-variables`,
      tags: [RuleTag.Styleguide, RuleTag.Upport, RuleTag.Quickfix, RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferXsdboolConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    if (this.reg.getConfig().getVersion() < Version.v740sp08 && this.reg.getConfig().getVersion() !== Version.Cloud) {
      return [];
    }

    for (const s of file.getStructure()?.findAllExpressions(Expressions.Source) || []) {
      if (s.concatTokens().toUpperCase().startsWith("BOOLC( ") === false) {
        continue;
      }
      const token = s.getFirstToken();

      const message = "Prefer xsdbool over boolc";
      const fix = EditHelper.replaceToken(file, token, "xsdbool");
      issues.push(Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity, fix));
    }

    return issues;
  }

}

