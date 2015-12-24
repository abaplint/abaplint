import Lexer from "./lexer";
import Statement from "./statement";


export default class Parser {
    private statements: Array<Statement> = [];

    constructor(private lexer: Lexer) {
    }

    public run(): Array<Statement> {
// todo
        return this.statements;
    }
}