import * as Tokens from "./tokens/tokens";
import File from "./file";

export default class Lexer {
    private tokens: Array<Tokens.Token> = [];

    constructor(private file: File) {
        this.run();
    }

    private run() {
        this.to_tokens();
        this.split_punctuation(".");
        this.split_punctuation(",");
        this.split_punctuation(":");
        this.handle_strings();
        this.handle_comments();

        this.file.set_tokens(this.tokens);
    }

    private handle_comments() {
        let result: Array<Tokens.Token> = [];
        let ignore = 0;

        for (let token of this.tokens) {
            if (token.get_row() === ignore) {
                continue;
            }

            let str = token.get_str();
            if ((str.substr(0, 1) === "*" && token.get_col() === 1)
                    || str.substr(0, 1) === "\"") {
                ignore = token.get_row();
                let comment = new Tokens.Comment(token.get_row(), token.get_col(), this.file.get_raw_row(token.get_row(), token.get_col()));
                result.push(comment);
            } else {
                result.push(token);
            }
        }
        this.tokens = result;
    }

    private split_punctuation(char: string) {
        let result: Array<Tokens.Token> = [];

        for (let token of this.tokens) {
            let str = token.get_str();
            if (str.substr(str.length - 1) === char) {
                token.set_str(str.substr(0, str.length - 1));
                result.push(token);
                let dot = new Tokens.Identifier(token.get_row(), token.get_col() + str.length - 1, char);
                result.push(dot);
            } else {
                result.push(token);
            }
        }
        this.tokens = result;
    }

    private to_tokens() {
        let lines = this.file.get_raw().split("\n");

        for (let row = 0; row < lines.length; row++) {
            let tokens = lines[row].split(" ");
            let col = 0;
            for (let token of tokens) {
                if (token.length > 0) {
                    let add = new Tokens.Identifier(row + 1, col + 1, token);
                    this.tokens.push(add);
                }
                col = col + token.length + 1;
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
        let result: Array<Tokens.Token> = [];
        let add: Tokens.Token;

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

}