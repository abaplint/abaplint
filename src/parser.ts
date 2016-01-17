import * as Tokens from "./tokens/tokens";
import File from "./file";
import * as Statements from "./statements/statements";

export default class Parser {
    private statements: Array<Statements.Statement> = [];

    constructor(private file: File) {
        this.run();
        this.categorize();
        file.set_statements(this.statements);
    }

    private categorize() {
        let result: Array<Statements.Statement> = [];

        for (let statement of this.statements) {
            if (statement instanceof Statements.Unknown) {
                for (let st in Statements) {
                    let known = Statements[st].match(statement.get_tokens());
                    if (known !== undefined) {
                        statement = known;
                        break;
                    }
                }
/*
                if (statement instanceof Statements.Unknown) {
                    console.log("Unknown: " +
                        this.file.get_filename() +
                        ", " +
                        statement.concat_tokens());
                }
*/
            }
//            console.dir(statement);
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
    }
}