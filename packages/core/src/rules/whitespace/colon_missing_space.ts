import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";

/** Checks for missing spaces after colons in chained statements. */
export class ColonMissingSpaceConf extends BasicRuleConfig {
}

export class ColonMissingSpace extends ABAPRule {

  private conf = new ColonMissingSpaceConf();

  public getKey(): string {
    return "colon_missing_space";
  }

  private getMessage(): string {
    return "Missing space after the colon";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ColonMissingSpaceConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const tokens = file.getTokens();

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.getStr() === ":"
          && tokens[i + 1] !== undefined
          && tokens[i + 1].getRow() === token.getRow()
          && tokens[i + 1].getCol() === token.getCol() + 1) {
        const issue = Issue.atPosition(file, token.getStart(), this.getMessage(), this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }
}