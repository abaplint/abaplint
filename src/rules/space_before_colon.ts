import {IRule} from "./rule";
import {ParsedFile} from "../file";
import {Issue} from "../issue";

export class SpaceBeforeColonConf {
  public enabled: boolean = true;
}

export class SpaceBeforeColon implements IRule {

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

  public run(file: ParsedFile) {
    let issues: Array<Issue> = [];
    let prev = file.getTokens[0];

    for (let token of file.getTokens()) {
      if (token.getStr() === ":"
          && prev.getRow() === token.getRow()
          && prev.getCol() + prev.getStr().length < token.getCol()) {
        let issue = new Issue(this, token.getPos(), file);
        issues.push(issue);
      }
      prev = token;
    }

    return issues;
  }

}