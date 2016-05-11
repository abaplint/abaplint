import { Rule } from "./rule";
import File from "../file";
import { Token } from "../tokens/";
import Issue from "../issue";
import Position from "../position";

export class LineOnlyPuncConf {
  public enabled: boolean = true;
}

export class LineOnlyPunc implements Rule {

    private conf = new LineOnlyPuncConf();

    public get_key(): string {
        return "line_only_punc";
    }

    public get_description(): string {
        return "Line contains only . or ).";
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
            let trim = rows[i].trim();
            if (trim === "." || trim === ").") {
                let issue = new Issue(this, new Position(i + 1, 0), file);
                file.add(issue);
            }
        }
    }

}