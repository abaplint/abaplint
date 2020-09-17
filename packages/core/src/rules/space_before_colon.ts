import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";

export class SpaceBeforeColonConf extends BasicRuleConfig {
}

export class SpaceBeforeColon extends ABAPRule {

  private conf = new SpaceBeforeColonConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "space_before_colon",
      title: "Space before colon",
      shortDescription: `Checks that there are no spaces in front of colons in chained statements.`,
      extendedInformation: `https://docs.abapopenchecks.org/checks/80/`,
      tags: [RuleTag.Whitespace],
      badExample: `DATA : foo TYPE string.`,
      goodExample: `DATA: foo TYPE string.`,
    };
  }

  private getMessage(): string {
    return "Remove space before colon";
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
        const issue = Issue.atToken(file, token, this.getMessage(), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      } else if (token.getStr() === ":"
          && prev.getRow() === token.getRow()
          && prev.getCol() + prev.getStr().length < token.getCol()) {
        const issue = Issue.atRowRange(file, token.getRow(),
                                       prev.getEnd().getCol(), token.getStart().getCol(),
                                       this.getMessage(), this.getMetadata().key, this.conf.severity);
//        const issue = Issue.atToken(file, token, this.getMessage(), this.getMetadata().key);
        issues.push(issue);
      }
      prev = token;
    }

    return issues;
  }

}