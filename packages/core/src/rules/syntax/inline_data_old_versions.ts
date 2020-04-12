import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {IRegistry} from "../../_iregistry";
import {Version} from "../../version";
import {Target} from "../../abap/2_statements/expressions";
import {BasicRuleConfig} from "../_basic_rule_config";

export class InlineDataOldVersionsConf extends BasicRuleConfig {
}

export class InlineDataOldVersions extends ABAPRule {
  private conf = new InlineDataOldVersionsConf();

  public getMetadata() {
    return {
      key: "inline_data_old_versions",
      title: "Inline data, old versions",
      quickfix: false,
      shortDescription: `Checks for inline data declarations in older releases. Only active for versions less than v740sp02`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: InlineDataOldVersionsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: IRegistry) {
    const issues: Issue[] = [];

    if (reg.getConfig().getVersion() >= Version.v740sp02) {
      return [];
    }

    for (const statement of file.getStatements()) {
// when parsed in old versions these expressions are NOT InlineData
      for (const target of statement.findAllExpressions(Target)) {
        const tokens = target.getAllTokens();
        if (tokens.length !== 4) {
          continue;
        }
        if (!tokens[0].getStr().match(/DATA/i)) {
          continue;
        }
        if (tokens[1].getStr() !== "(") {
          continue;
        }
        if (tokens[3].getStr() !== ")") {
          continue;
        }

        const message = "Inline DATA not possible in " + reg.getConfig().getVersion();
        const issue = Issue.atToken(file, tokens[0], message, this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }
}