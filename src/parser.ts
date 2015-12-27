import { Token } from "./tokens/tokens";
import File from "./file";
import { Statement } from "./statements/statements";

export default class Parser {
    private statements: Array<Statement> = [];

    constructor(private file: File) {
        this.run();
        file.set_statements(this.statements);
    }

    private run() {
        let add: Array<Token> = [];
        let pre: Array<Token> = [];
        let tokens = this.file.get_tokens();
        for (let token of tokens) {
            add.push(token);
            if (token.get_str() === ".") {
                let statement = new Statement(pre.concat(add));
                this.statements.push(statement);
                add = [];
                pre = [];
            } else if (token.get_str() === ",") {
                let statement = new Statement(pre.concat(add));
                this.statements.push(statement);
                add = [];
            } else if (token.get_str() === ":") {
                pre = add.slice(0);
                add = [];
            }
        }
    }
}