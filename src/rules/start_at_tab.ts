import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import * as Statements from "../statements/";

class Conf {
  public enabled: boolean = true;
}

export class Check01 implements Rule {

    private conf: Conf = new Conf();

    public get_key(): string {
        return "start_at_tab";
    }

    public get_description(): string {
        return "Start statement at tab position";
    }

    public get_config() {
        return this.conf;
    }

    public set_config(conf) {
        this.conf = conf;
    }

    public run(file: File) {
        for (let statement of file.get_statements()) {
            if (statement instanceof Statements.Comment) {
                continue;
            }

            let pos = statement.get_start();
            if ((pos.get_col() - 1) % 2 !== 0) {
                let issue = new Issue(this, pos, file);
                file.add(issue);
            }
        }
    }

}