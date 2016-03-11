import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/";

class Conf {
  public enabled: boolean = true;
}

export class Check11 implements Rule {

    private conf: Conf = new Conf();

    public get_key(): string {
        return "7bit_ascii";
    }

    public get_description(): string {
        return "Contains non 7 bit ascii character";
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
            if (/^[\u0000-\u007f]*$/.test(rows[i]) === false) {
                let issue = new Issue(this, new Position(i + 1, 1), file);
                file.add(issue);
            }
        }
    }
}