import * as Tokens from "./tokens/tokens";
import File from "./file";
import * as Statements from "./statements/statements";

export default class Parser {
    private statements: Array<Statements.Statement> = [];

    constructor(private file: File) {
        this.run();
        file.set_statements(this.statements);
    }

    private run() {
        let add: Array<Tokens.Token> = [];
        let pre: Array<Tokens.Token> = [];
        let tokens = this.file.get_tokens();
        for (let token of tokens) {
            if (token instanceof Tokens.Comment) {
                this.statements.push(new Statements.Comment([token]));
                continue;
            }

            add.push(token);
            if (token.get_str() === ".") {
                let statement = new Statements.Unknown(pre.concat(add));
                this.statements.push(statement);
                add = [];
                pre = [];
            } else if (token.get_str() === ",") {
                let statement = new Statements.Unknown(pre.concat(add));
                this.statements.push(statement);
                add = [];
            } else if (token.get_str() === ":") {
                pre = add.slice(0);
                add = [];
            }
        }
    }
}