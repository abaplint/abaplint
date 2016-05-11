import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/";

export class WhitespaceEndConf {
  public enabled: boolean = true;
}

export class WhitespaceEnd implements Rule {

    private conf = new WhitespaceEndConf();

    public get_key(): string {
        return "whitespace_end";
    }

    public get_description(): string {
        return "Whitespace at end of line";
    }

    public get_config() {
        return this.conf;
    }

    public set_config(conf) {
        this.conf = conf;
    }

    public run(file: File) {
        let rows = file.get_raw_rows();

        for (let i = 0; i < rows.length; i++) {
            if (/.* $/.test(rows[i]) === true) {
                let issue = new Issue(this, new Position(i + 1, 1), file);
                file.add(issue);
            }
        }
    }
}