import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";

class Conf {
  public enabled: boolean = true;
}

export class Check07 implements Rule {

    private conf: Conf = new Conf();

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
        let prev = file.get_tokens[0];

        for (let token of file.get_tokens()) {
            if (token.get_str() === ":"
                    && prev.get_row() == token.get_row()
                    && prev.get_col() + prev.get_str().length < token.get_col()) {
                let issue = new Issue(this, token.get_pos(), file);
                file.add(issue);
            }
            prev = token;
        }
    }

}