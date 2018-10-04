import {Issue} from "../issue";
import {ABAPRule} from "./abap_rule";
import {ParsedFile} from "../files";

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

  public runParsed(file: ParsedFile) {
    let issues: Array<Issue> = [];

    let tokens = file.getTokens();

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      if (token.getStr() === ":"
          && tokens[i + 1] !== undefined
          && tokens[i + 1].getRow() === token.getRow()
          && tokens[i + 1].getCol() === token.getCol() + 1) {
        let issue = new Issue(this, file, 1, token.getPos());
        issues.push(issue);
      }
    }

    return issues;
  }
}