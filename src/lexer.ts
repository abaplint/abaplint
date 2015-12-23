export default class Lexer {
    private raw: string;

    constructor(raw: string) {
        this.raw = raw;
    }

    run() {
        console.dir(this.raw);
        let lines = this.raw.split("\n");
        console.dir(lines);
    }

    get_statements() {
        console.log("get statements");
    }
}

// statement consists of tokens
// multiple different types of statements
// parameter list
// identifier
// string literal
// source position