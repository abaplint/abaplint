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
        this.handle_pragmas();

// console.dir(this.tokens);
        this.file.set_tokens(this.tokens);
    }

    private handle_pragmas() {
        let result: Array<Tokens.Token> = [];

        for (let token of this.tokens) {

            let str = token.get_str();
            if (str.length > 2 && str.substr(0, 1) === "#" ) {
                let raw = this.file.get_raw_row(token.get_row(), token.get_col());
                let pragma = new Tokens.Pragma(token.get_row(), token.get_col(), raw);
                result.push(pragma);
            } else {
                result.push(token);
            }
        }
        this.tokens = result;
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
                let raw = this.file.get_raw_row(token.get_row(), token.get_col() - 1);
                let comment = new Tokens.Comment(token.get_row(), token.get_col(), raw);
                result.push(comment);
            } else {
                result.push(token);
            }
        }

        this.tokens = result;
    }

// todo, simplify. loop through uisng "SEARCH FOR" instead of string split
   private split_punctuation(char: string) {
        let result: Array<Tokens.Token> = [];

        for (let token of this.tokens) {
            let str = token.get_str();

            if (str === char) {
                result.push(token);
                continue;
            }

            let strlist = str.split(char);
            let row = token.get_row();
            let col = token.get_col();

            if (strlist.length > 1) {
                for (let i = 0; i < strlist.length; i++) {
                    let split = strlist[i];
                    if (split.length > 0 && i === strlist.length - 1) {
                        let add = new Tokens.Identifier(row, col, split);
                        result.push(add);
                    } else if (i !== strlist.length - 1) {
                        let add = new Tokens.Identifier(row, col, split);
                        result.push(add);
                        if (split.length > 0) {
                            let dot = new Tokens.Identifier(row, col + split.length , char);
                            result.push(dot);
                        }
                        col = col + split.length + 1;
                    }
                }
            } else {
                result.push(token);
            }
        }

        this.tokens = result;
    }

    private to_tokens() {
        let lines = this.file.get_raw().split("\n");

        for (let row = 0; row < lines.length; row++) {
            lines[row] = lines[row].replace(/\t/g, " ");
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

// todo, concatenate while looking at token position,
// space between tokens is not always correct
    private concat_tokens(tokens: Array<Tokens.Token>): string {
        let result = "";
        for (let token of tokens) {
            result = result + " " + token.get_str();
        }
        return result.trim();
    }

    private start_ok(str: string): boolean {
        let start = str.substr(0, 1);
        return start === "'";
    }

    private end_ok(str: string): boolean {
        let end = str.substr(str.length - 1);
        return ( end === "'" && str.length > 1 ) || /\'\(\d\d\d\)$/.test(str);
    }

    private is_string(tokens: Array<Tokens.Token>): boolean {
        let str = this.concat_tokens(tokens).replace(/''/g, "");

        if (this.start_ok(str)
                && this.end_ok(str)) {
            return true;
        }
        return false;
    }

    private collapse(tokens: Array<Tokens.Token>): Tokens.Token {
        let token = tokens[0];

        for (let i = 1; i < tokens.length; i++) {
            token.set_str(token.get_str() + " " + tokens[i].get_str());
        }

        return token;
    }

    private check_ok_string(tokens: Array<Tokens.Token>): boolean {
        let str = this.concat_tokens(tokens).replace(/''/g, "");

        if (this.start_ok(str)) {
            if (this.end_ok(str)) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

// todo, hmm, this method is messed up
    private handle_strings() {
        let result: Array<Tokens.Token> = [];
        let str: Array<Tokens.Token> = [];
        let row = this.tokens[0].get_row();

        for (let token of this.tokens) {
            if (token.get_row() !== row) {
                result = result.concat(str);
                str = [];
                row = token.get_row();
            }

            str.push(token);

            if (this.check_ok_string(str)) {
                if (this.is_string(str)) {
                    str = [this.collapse(str)];
                }
                result = result.concat(str);
                str = [];
            }
        }
        result = result.concat(str);

        this.tokens = result;
    }

}