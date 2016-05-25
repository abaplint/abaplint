import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/";

export class ColonMissingSpaceConf {
  public enabled: boolean = true;
}

export class ColonMissingSpace implements Rule {

  private conf = new ColonMissingSpaceConf();

  public get_key(): string {
    return "colon_missing_space";
  }

  public get_description(): string {
    return "Missing space after colon";
  }

  public get_config() {
    return this.conf;
  }

  public set_config(conf) {
    this.conf = conf;
  }

  public run(file: File) {
    let tokens = file.getTokens();

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      if (token.getStr() === ":"
          && tokens[i+1] !== undefined
          && tokens[i+1].getRow() === token.getRow()
          && tokens[i+1].getCol() === token.getCol() + 1) {
        let issue = new Issue(this, token.getPos(), file);
        file.add(issue);
      }
    }
  }
}