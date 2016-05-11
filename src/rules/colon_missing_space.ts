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
        let tokens = file.get_tokens();

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            if (token.get_str() === ":"
                    && tokens[i+1] !== undefined
                    && tokens[i+1].get_row() === token.get_row()
                    && tokens[i+1].get_col() === token.get_col() + 1) {
                let issue = new Issue(this, token.get_pos(), file);
                file.add(issue);
            }
        }
    }
}