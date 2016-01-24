import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/";

export class Check09 implements Rule {

    public get_key(): string {
        return "parser_error";
    }

    public get_description(): string {
        return "Parser error(Unknown statement)";
    }

    public run(file: File) {
        let pos = new Position(0, 0);
        for (let statement of file.get_statements()) {
// only report one error per row
            if (statement instanceof Statements.Unknown
                    && pos.get_row() !== statement.get_start().get_row()) {
                pos = statement.get_start();
                let issue = new Issue(this, pos, file);
                file.add(issue);
            }
        }
    }

}