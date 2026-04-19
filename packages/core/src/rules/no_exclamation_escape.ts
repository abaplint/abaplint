import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper} from "../edit_helper";
import {Identifier} from "../abap/1_lexer/tokens";

export class NoExclamationEscapeConf extends BasicRuleConfig {
}

export class NoExclamationEscape extends ABAPRule {
  private conf = new NoExclamationEscapeConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_exclamation_escape",
      title: "No exclamation escape",
      shortDescription: `Detects and removes exclamation marks (!) used to escape identifiers`,
      // eslint-disable-next-line max-len
      extendedInformation: `Exclamation marks are not needed when the identifier is not a reserved keyword, or could be avoided by renaming.`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: "methods CONVERT changing !CO_sdf type ref to ZCL_sdf optional.",
      goodExample: "methods CONVERT changing CO_sdf type ref to ZCL_sdf optional.",
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoExclamationEscapeConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    for (const token of file.getTokens()) {
      if (token instanceof Identifier) {
        const str = token.getStr();
        if (str.startsWith("!")) {
          const replacement = str.substring(1);
          const fix = EditHelper.replaceToken(file, token, replacement);
          issues.push(Issue.atToken(file, token, "Do not use exclamation mark to escape identifiers", this.getMetadata().key, this.conf.severity, fix));
        }
      }
    }

    return issues;
  }
}
