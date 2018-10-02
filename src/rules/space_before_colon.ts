import {Issue} from "../issue";
import {ABAPRule} from "./abap_rule";
import {ParsedFile} from "../files";

export class SpaceBeforeColonConf {
  public enabled: boolean = true;
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

  public setConfig(conf) {
    this.conf = conf;
  }

  public runParsed(file: ParsedFile) {
    let issues: Array<Issue> = [];

    let prev = file.getTokens[0];

    for (let token of file.getTokens()) {
      if (token.getStr() === ":" && !prev) {
        let issue = new Issue(this, file, 1, token.getPos());
        issues.push(issue);
      } else if (token.getStr() === ":"
          && prev.getRow() === token.getRow()
          && prev.getCol() + prev.getStr().length < token.getCol()) {
        let issue = new Issue(this, file, 1, token.getPos());
        issues.push(issue);
      }
      prev = token;
    }

    return issues;
  }

}