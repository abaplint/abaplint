import Token from "./token";

export default class Lexer {
    private tokens: Array<Token> = [];

    constructor(private raw: string) {
    }

    public run(): Array<Token> {
        this.build_tokens();

        return this.tokens;
    }

    private split_punctuation(char: string) {
        let result: Array<Token> = [];

        for (let token of this.tokens) {
            let str = token.get_str();
            if (str.substr(str.length - 1) === char) {
                token.set_str(str.substr(0, str.length - 1));
                result.push(token);
                let dot = new Token(token.get_row(), token.get_col() + str.length - 1, char);
                result.push(dot);
            } else {
                result.push(token);
            }
        }
        this.tokens = result;
    }

    private to_tokens() {
        let lines = this.raw.split("\n");

        for (let row = 0; row < lines.length; row++) {
            let tokens = lines[row].split(" ");
            let col = 0;
            for (let key in tokens) {
                if (tokens[key].length > 0) {
                    let token = new Token(row, col, tokens[key]);
                    this.tokens.push(token);
                }
                col = col + tokens[key].length + 1;
            }
        }
    }

    private check_ok_string(str: string): boolean {
        str = str.replace(/''/g, "");

        let start = str.substr(0, 1);
        let end = str.substr(str.length - 1);
        if (start === "'") {
            if (end === "'") {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    private handle_strings() {
        let result: Array<Token> = [];
        let add: Token;

        for (let token of this.tokens) {
            if (add === undefined) {
                add = token;
            } else {
                add.set_str(add.get_str() + " " + token.get_str());
            }
            if (this.check_ok_string(add.get_str())) {
                result.push(add);
                add = undefined;
            }
        }
        this.tokens = result;
    }

    private build_tokens() {
        this.to_tokens();
        this.split_punctuation(".");
        this.split_punctuation(",");
        this.split_punctuation(":");
        this.handle_strings();
    }

    public get_tokens(): Array<Token> {
        return this.tokens;
    }
}