import {IRule} from "./rule";
import {Issue} from "../issue";
import {ABAPObject} from "../objects";

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

  public run(obj) {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let issues: Array<Issue> = [];

    for (let file of abap.getParsed()) {
      let prev = file.getTokens[0];

      for (let token of file.getTokens()) {
        if (token.getStr() === ":" && !prev) {
          let issue = new Issue(this, file, token.getPos());
          issues.push(issue);
        } else if (token.getStr() === ":"
            && prev.getRow() === token.getRow()
            && prev.getCol() + prev.getStr().length < token.getCol()) {
          let issue = new Issue(this, file, token.getPos());
          issues.push(issue);
        }
        prev = token;
      }
    }

    return issues;
  }

}