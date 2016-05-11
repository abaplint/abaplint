import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import * as Statements from "../statements/";

export class EmptyStatementConf {
  public enabled: boolean = true;
}

export class EmptyStatement implements Rule {

    private conf = new EmptyStatementConf();

    public get_key(): string {
        return "empty_statement";
    }

    public get_description(): string {
        return "Empty statement";
    }

    public get_config() {
        return this.conf;
    }

    public set_config(conf) {
        this.conf = conf;
    }

    public run(file: File) {
        let statements = file.get_statements();

        for (let sta of statements) {
            if (sta instanceof Statements.Empty) {
                let issue = new Issue(this, sta.get_start(), file);
                file.add(issue);
            }
        }
    }
}