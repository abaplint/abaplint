import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";

class Conf {
  public enabled: boolean = true;
  public length: number = 120;
}

export class LineLength implements Rule {

    private conf: Conf = new Conf();

    public get_key(): string {
        return "line_length";
    }

    public get_description(): string {
        return "Reduce line length";
    }

    public get_config() {
        return this.conf;
    }

    public set_config(conf) {
        this.conf = conf;
    }

    public run(file: File) {
        let lines = file.get_raw().split("\n");
        for (let line = 0; line < lines.length; line++) {
            if (lines[line].length > this.conf.length) {
                let issue = new Issue(this, new Position(line + 1, 1), file);
                file.add(issue);
            }
        }
    }

}