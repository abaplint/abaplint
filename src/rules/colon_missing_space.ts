import {IRule} from "./rule";
import {File} from "../file";
import Issue from "../issue";

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

  public run(file: File) {
    let tokens = file.getTokens();

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      if (token.getStr() === ":"
          && tokens[i + 1] !== undefined
          && tokens[i + 1].getRow() === token.getRow()
          && tokens[i + 1].getCol() === token.getCol() + 1) {
        let issue = new Issue(this, token.getPos(), file);
        file.add(issue);
      }
    }
  }
}