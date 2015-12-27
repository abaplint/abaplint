import { Token } from "./tokens/tokens";
import { Statement } from "./statements/statements";
import Lexer from "./lexer";
import Parser from "./parser";

export default class File {
    private tokens: Array<Token> = [];
    private statements: Array<Statement> = [];

    constructor(private filename: string, private raw: string) {
        new Lexer(this);
        new Parser(this);
    }

    public get_raw(): string {
        return this.raw;
    }

    public get_filename(): string {
        return this.filename;
    }

    public set_tokens(tokens: Array<Token>) {
        this.tokens = tokens;
    }

    public set_statements(statements: Array<Statement>) {
        this.statements = statements;
    }

    public get_tokens(): Array<Token> {
        return this.tokens;
    }

    public get_statements(): Array<Statement> {
        return this.statements;
    }
}