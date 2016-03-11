import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import * as Statements from "../statements/";

class Conf {
  public enabled: boolean = true;
}

export class Check12 implements Rule {

    private conf = new Conf();

    public get_key(): string {
        return "obsolete_statement";
    }

    public get_description(): string {
        return "Statement is obsolete";
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
            if (sta instanceof Statements.Refresh
                    || sta instanceof Statements.Compute
                    || sta instanceof Statements.Add
                    || sta instanceof Statements.Subtract
                    || sta instanceof Statements.Multiply
                    || ( sta instanceof Statements.Move
                    && sta.get_tokens()[0].get_str() === 'MOVE'
                    && sta.get_tokens()[1].get_str() !== '-' )
                    || sta instanceof Statements.Divide) {
                let issue = new Issue(this, sta.get_start(), file);
                file.add(issue);
            }
        }
    }
}