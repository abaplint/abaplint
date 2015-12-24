import Token from "./token";
import Lexer from "./lexer";
import Statement from "./statement";


export default class Parser {
    private statements: Array<Statement> = [];

    constructor(private lexer: Lexer) {
    }

    public run(): Array<Statement> {
        let add: Array<Token> = [];
        let tokens = this.lexer.get_tokens();
        for (let token of tokens) {
            if (token.get_str() === ".") {
                this.statements.push(new Statement(add));
            } else {
                add.push(token);
            }
        }

        return this.statements;
    }
}