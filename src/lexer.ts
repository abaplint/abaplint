import * as Tokens from "./tokens/";
import File from "./file";
import Position from "./position";

// todo, use enum instead?
const NORMAL = 1;
const PING = 2;
const STR = 3;
const TEMPLATE = 4;
const COMMENT = 5;

export default class Lexer {
    private static tokens: Array<Tokens.Token>;
    private static m;

    public static run(file: File): Array<Tokens.Token> {
        this.tokens = [];
        this.m = NORMAL;

        this.process(file.get_raw());

        return this.tokens;
    }

    private static add(s: string, row: number, col: number) {
        if (s.length > 0) {
            let pos = new Position(row, col - s.length);
            if (this.m === COMMENT) {
                this.tokens.push(new Tokens.Comment(pos, s));
            } else if (this.m === PING || this.m === STR || this.m === TEMPLATE) {
                this.tokens.push(new Tokens.String(pos, s));
            } else if (s.substr(0, 1) === "#") {
                this.tokens.push(new Tokens.Pragma(pos, s));
            } else if (s.length === 1 && (s === "." || s === ",")) {
                this.tokens.push(new Tokens.Punctuation(pos, s));
            } else if (s.length === 1 && s === "[") {
                this.tokens.push(new Tokens.BracketLeft(pos, s));
            } else if (s.length === 1 && s === "(") {
                this.tokens.push(new Tokens.ParenLeft(pos, s));
            } else if (s.length === 1 && s === "]") {
                this.tokens.push(new Tokens.BracketRight(pos, s));
            } else if (s.length === 1 && s === ")") {
                this.tokens.push(new Tokens.ParenRight(pos, s));
            } else if (s.length === 1 && s === "-") {
                this.tokens.push(new Tokens.Dash(pos, s));
            } else if (s.length === 2 && (s === "->" || s === "=>")) {
                this.tokens.push(new Tokens.Arrow(pos, s));
            } else {
                this.tokens.push(new Tokens.Identifier(pos, s));
            }
        }
    }

    private static process(raw: string) {
        let before = "";

        let row = 1;
        let col = 1;

        while (raw.length > 0) {
            let char = raw.substr(0, 1);
            let ahead = raw.substr(1, 1);
            let bchar = before.substr(before.length - 1, 1);

            if ((char === " " || char === "\t") && this.m === NORMAL) {
                this.add(before, row, col);
                before = "";
            } else if ( (char === "." || char === "," || char === ":" || char === "]" || char === ")" )
                    && this.m === NORMAL) {
                this.add(before, row, col);
                this.add(char, row, col + 1);
                before = "";
            } else if ( (char === "[" || char === "(") && before.length > 0 && this.m === NORMAL) {
                this.add(before, row, col);
                this.add(char, row, col + 1);
                before = "";
            } else if ( char === "-" && before.length > 0 && ahead !== ">" && ahead !== " " && this.m === NORMAL) {
                this.add(before, row, col);
                this.add(char, row, col + 1);
                before = "";
            } else if ( char === ">" && (bchar === "-" || bchar === "=" ) && ahead !== " " && this.m === NORMAL) {
                this.add(before.substr(0, before.length - 1), row, col - 1);
                this.add(bchar + char, row, col + 1);
                before = "";
            } else if (char === "\n") {
                this.add(before, row, col);
                before = "";
                row = row + 1;
                col = 0;
                this.m = NORMAL;
            } else if (char === "'" && this.m === NORMAL) {
                this.m = STR;
                this.add(before, row, col);
                before = char;
            } else if (char === "`" && this.m === NORMAL) {
                this.m = PING;
                this.add(before, row, col);
                before = char;
            } else if (char === "|" && this.m === NORMAL) {
                this.m = TEMPLATE;
                before = before + char;
            } else if (char === "\"" && this.m === NORMAL) {
                this.m = COMMENT;
                before = before + char;
            } else if (char === "*" && col === 1 && this.m === NORMAL) {
                this.m = COMMENT;
                before = before + char;
            } else if (char === "'" && ahead === "'" && this.m === STR) {
                before = before + char + ahead;
                col = col + 1;
                raw = raw.substr(1);
            } else if ((char === "'" && this.m === STR)
                    || (char === "`" && this.m === PING)
                    || (char === "|" && this.m === TEMPLATE)) {
                before = before + char;
                this.add(before, row, col + 1);
                before = "";
                this.m = NORMAL;
            } else {
                before = before + char;
            }

            col = col + 1;
            raw = raw.substr(1);
        }
        this.add(before, row, col);
    }

}