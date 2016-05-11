import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import * as Statements from "../statements/";

export class ExitOrCheckConf {
  public enabled: boolean = true;
}

export class ExitOrCheck implements Rule {

    private conf = new ExitOrCheckConf();

    public get_key(): string {
        return "exit_or_check";
    }

    public get_description(): string {
        return "EXIT or CHECK outside of loop";
    }

    public get_config() {
        return this.conf;
    }

    public set_config(conf) {
        this.conf = conf;
    }

    public run(file: File) {
        let stack: Array<Statements.Statement> = [];

        for (let statement of file.get_statements()) {
            if (statement instanceof Statements.Loop
                    || statement instanceof Statements.While
                    || statement instanceof Statements.Do) {
                stack.push(statement);
            } else if (statement instanceof Statements.Endloop
                    || statement instanceof Statements.Endwhile
                    || statement instanceof Statements.Enddo) {
                stack.pop();
            } else if ((statement instanceof Statements.Check
                    || statement instanceof Statements.Exit)
                    && stack.length === 0) {
                let issue = new Issue(this, statement.get_start(), file);
                file.add(issue);
            }
        }
    }

}