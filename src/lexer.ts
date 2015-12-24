import Token from "./token";
import Statement from "./statement";


export default class Lexer {
    private tokens: Array<Token> = [];

    constructor(private raw: string) {
    }

    split_punctuation() {
        let result: Array<Token> = [];

        for (let key in this.tokens) {
            let token = this.tokens[key];
            let str = token.get_str();
            if (str.substr(str.length - 1) === ".") {
                token.set_str(str.substr(0, str.length - 1));
                result.push(token);
                let dot = new Token(this.tokens[key].get_row(), token.get_col() + str.length - 1, ".");
                result.push(dot);
            } else {
                result.push(token);
            }
        }
        this.tokens = result;
    }


    to_tokens() {
        let lines = this.raw.split("\n");

        for (let row = 0; row < lines.length; row++) {
            let tokens = lines[row].split(" ");
            let col = 0;
            for (let key in tokens) {
                if (tokens[key].length > 0) {
                    let token = new Token(row, col, tokens[key]);
                    this.tokens.push(token);
                    col = col + tokens[key].length + 1;
                }
            }
        }
    }

    build_tokens() {
        this.to_tokens();
        this.split_punctuation();
    }

    run(): Array<Token> {
        this.build_tokens();

        return this.tokens;
    }

    get_tokens(): Array<Token> {
        return this.tokens;
    }
}