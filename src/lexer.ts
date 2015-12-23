import Token from "./token";
import Statement from "./statement";


export default class Lexer {
    private raw: string;
    private statements: Array<Statement>;

    constructor(raw: string) {
        this.raw = raw;
    }

    run(): Array<Statement> {
        let lines = this.raw.split("\n");
        let list: Array<Token> = [];

        for (let row = 0; row < lines.length; row++) {
            let tokens = lines[row].split(" ");
            let col: number = 0;
            for (let j = 0; j < tokens.length; j++) {
                console.log("row " + row + " token " + tokens[j]);

                if (tokens[j].substr(tokens[j].length - 1) === ".") {
                    console.log("ends");
                }

                let token = new Token(row, col, tokens[j]);
                list.push(token);
            }
        }

        return this.statements;
    }

    get_statements(): Array<Statement> {
        console.log("get statements");
        return this.statements;
    }
}