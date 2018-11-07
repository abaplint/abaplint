import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Registry} from "../registry";
import {Version, versionToText} from "../version";
import {Target} from "../abap/expressions";

export class InlineDataOldVersionsConf {
  public enabled: boolean = true;
}

export class InlineDataOldVersions extends ABAPRule {
  private conf = new InlineDataOldVersionsConf();

  public getKey(): string {
    return "inline_data_old_versions";
  }

  public getDescription(): string {
    return "Inline DATA in old versions";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: InlineDataOldVersionsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry) {
    let issues: Array<Issue> = [];

    if (reg.getConfig().getVersion() >= Version.v740sp02) {
      return [];
    }

    for (let statement of file.getStatements()) {
// when parsed in old versions these expressions are NOT InlineData
      for (let target of statement.findAllExpressions(Target)) {
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

        let message = "Inline DATA not possible in " + versionToText(reg.getConfig().getVersion());
        issues.push(new Issue({file, message, start: tokens[0].getPos()}));
      }
    }

    return issues;
  }
}