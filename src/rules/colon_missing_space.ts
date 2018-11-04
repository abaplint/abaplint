import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";

export class ColonMissingSpaceConf {
  public enabled: boolean = true;
}

export class ColonMissingSpace extends ABAPRule {

  private conf = new ColonMissingSpaceConf();

  public getKey(): string {
    return "colon_missing_space";
  }

  public getDescription(): string {
    return "Missing space after colon";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ColonMissingSpaceConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let issues: Array<Issue> = [];

    let tokens = file.getTokens();

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      if (token.getStr() === ":"
          && tokens[i + 1] !== undefined
          && tokens[i + 1].getRow() === token.getRow()
          && tokens[i + 1].getCol() === token.getCol() + 1) {
        let issue = new Issue({rule: this, file, message: 1, start: token.getPos()});
        issues.push(issue);
      }
    }

    return issues;
  }
}