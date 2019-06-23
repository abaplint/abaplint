import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";

export class SpaceBeforeColonConf extends BasicRuleConfig {
}

export class SpaceBeforeColon extends ABAPRule {

  private conf = new SpaceBeforeColonConf();

  public getKey(): string {
    return "space_before_colon";
  }

  public getDescription(): string {
    return "Space before colon";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SpaceBeforeColonConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    let prev = file.getTokens()[0];

    for (const token of file.getTokens()) {
      if (token.getStr() === ":" && !prev) {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: token.getStart()});
        issues.push(issue);
      } else if (token.getStr() === ":"
          && prev.getRow() === token.getRow()
          && prev.getCol() + prev.getStr().length < token.getCol()) {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: token.getStart()});
        issues.push(issue);
      }
      prev = token;
    }

    return issues;
  }

}