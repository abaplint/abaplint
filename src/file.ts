import { Token } from "./tokens/";
import { Statement } from "./statements/";
import Lexer from "./lexer";
import Parser from "./parser";
import Issue from "./issue";

export default class File {
    private tokens: Array<Token> = [];
    private statements: Array<Statement> = [];
    private issues: Array<Issue> = [];
    private raw: string = "";
    private filename: string = "";

    constructor(filename: string, raw: string) {
// ignore all carriage returns
        this.raw = raw.replace(/\r/g,"");
        this.filename = filename;
        new Lexer(this);
        new Parser(this);
    }

// todo, something wrong here, refactor?
    public add(issue: Issue) {
        this.issues.push(issue);
    }

    public get_count(): number {
        return this.issues.length;
    }

    public get_issues(): Array<Issue> {
        return this.issues;
    }

    public get_raw(): string {
        return this.raw;
    }

    public get_raw_rows(): Array<string> {
        return this.raw.split("\n");
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