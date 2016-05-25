import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";

export class SpaceBeforeColonConf {
  public enabled: boolean = true;
}

export class SpaceBeforeColon implements Rule {

  private conf = new SpaceBeforeColonConf();

  public get_key(): string {
    return "space_before_colon";
  }

  public get_description(): string {
    return "Space before colon";
  }

  public get_config() {
    return this.conf;
  }

  public set_config(conf) {
    this.conf = conf;
  }

  public run(file: File) {
    let prev = file.getTokens[0];

    for (let token of file.getTokens()) {
      if (token.getStr() === ":"
          && prev.getRow() == token.getRow()
          && prev.getCol() + prev.getStr().length < token.getCol()) {
        let issue = new Issue(this, token.getPos(), file);
        file.add(issue);
      }
      prev = token;
    }
  }

}