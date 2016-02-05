import * as Tokens from "./tokens/";
import File from "./file";
import * as Statements from "./statements/";

export default class Parser {
    private statements: Array<Statements.Statement> = [];

    constructor(private file: File) {
        this.run();
        this.categorize();
        this.macros();
        file.set_statements(this.statements);
    }

    private macros() {
        let result: Array<Statements.Statement> = [];
        let define = false;

        for (let statement of this.statements) {
            if (statement instanceof Statements.Define) {
                define = true;
            } else if (statement instanceof Statements.Enddefine) {
                define = false;
            } else if (statement instanceof Statements.Unknown && define === true) {
                statement = new Statements.Macro(statement.get_tokens());
            }

            result.push(statement);
        }

        this.statements = result;
    }

    private categorize() {
        let result: Array<Statements.Statement> = [];

        for (let statement of this.statements) {
            let last = statement.get_tokens()[statement.get_tokens().length - 1];
            if (statement instanceof Statements.Unknown && last instanceof Tokens.Punctuation) {
                for (let st in Statements) {
                    let known = Statements[st].match(statement.get_tokens());
                    if (known !== undefined) {
                        statement = known;
                        break;
                    }
                }
            }
            result.push(statement);
        }

        this.statements = result;
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
            } else if (token.get_str() === "," && pre.length > 0) {
                let statement = new Statements.Unknown(pre.concat(add));
                this.statements.push(statement);
                add = [];
            } else if (token.get_str() === ":") {
                add.pop(); // do not add colon token to statement
                pre = add.slice(0);
                add = [];
            }
        }

        if (add.length > 0) {
            let statement = new Statements.Unknown(pre.concat(add));
            this.statements.push(statement);
        }
    }
}