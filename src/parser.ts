import Token from "./token";
import Lexer from "./lexer";
import Statement from "./statement";


export default class Parser {
    private statements: Array<Statement> = [];

    constructor(private lexer: Lexer) {
        this.run();
    }

    private run(): Array<Statement> {
        let add: Array<Token> = [];
        let pre: Array<Token> = [];
        let tokens = this.lexer.get_tokens();
        for (let token of tokens) {
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
            } else {
                add.push(token);
            }
        }

        return this.statements;
    }

    public get_statements(): Array<Statement> {
        return this.statements;
    }

    public get_lexer(): Lexer {
        return this.lexer;
    }
}