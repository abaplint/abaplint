import * as Tokens from "./tokens/";
import File from "./file";
import Position from "./position";

const NORMAL = 1;
const PING = 2;
const STR = 3;
const TEMPLATE = 4;
const COMMENT = 5;

export default class Lexer {
    private tokens: Array<Tokens.Token> = [];

    private m = NORMAL;

    constructor(private file: File) {
        this.run();
        this.file.set_tokens(this.tokens);
    }

    private add(s: string, row: number, col: number) {
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
            } else {
                this.tokens.push(new Tokens.Identifier(pos, s));
            }
        }
    }

    private run() {
        let raw = this.file.get_raw();
        let before = "";

        let row = 1;
        let col = 1;

        while (raw.length > 0) {
            let char = raw.substr(0, 1);
            let ahead = raw.substr(1, 1);

            if ((char === " " || char === "\t") && this.m === NORMAL) {
                this.add(before, row, col);
                before = "";
            } else if ( (char === "." || char === "," || char === ":") && this.m === NORMAL) {
                this.add(before, row, col);
                this.add(char, row, col + 1);
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