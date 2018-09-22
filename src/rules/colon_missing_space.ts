import {IRule} from "./rule";
import {ParsedFile} from "../file";
import {Issue} from "../issue";

export class ColonMissingSpaceConf {
  public enabled: boolean = true;
}

export class ColonMissingSpace implements IRule {

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

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(file: ParsedFile) {
    let tokens = file.getTokens();
    let issues: Array<Issue> = [];

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      if (token.getStr() === ":"
          && tokens[i + 1] !== undefined
          && tokens[i + 1].getRow() === token.getRow()
          && tokens[i + 1].getCol() === token.getCol() + 1) {
        let issue = new Issue(this, file, token.getPos());
        issues.push(issue);
      }
    }

    return issues;
  }
}