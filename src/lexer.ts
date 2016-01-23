import * as Tokens from "./tokens/tokens";
import File from "./file";
import Position from "./position";

export default class Lexer {
    private tokens: Array<Tokens.Token> = [];

    private modeNormal = 1;
    private modePing = 2;
    private modeStr = 3;
    private modeTemplate = 4;
    private modeComment = 5;

    private m = this.modeNormal;

    constructor(private file: File) {
        this.run();
        this.file.set_tokens(this.tokens);
    }

    private add(s: string, row: number, col: number) {
        if (s.length > 0) {
            let pos = new Position(row, col - s.length);
            if (this.m === this.modeComment) {
                this.tokens.push(new Tokens.Comment(pos, s));
            } else if (s.substr(0, 1) === "#") {
                this.tokens.push(new Tokens.Pragma(pos, s));
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

            if ((char === " " || char === "\t") && this.m === this.modeNormal) {
                this.add(before, row, col);
                before = "";
            } else if ( (char === "." || char === "," || char === ":") && this.m === this.modeNormal) {
                this.add(before, row, col);
                this.add(char, row, col + 1);
                before = "";
            } else if (char === "\n") {
                this.add(before, row, col);
                before = "";
                row = row + 1;
                col = 0;
                this.m = this.modeNormal;
            } else if (char === "'" && this.m === this.modeNormal) {
                this.m = this.modeStr;
                this.add(before, row, col);
                before = char;
            } else if (char === "`" && this.m === this.modeNormal) {
                this.m = this.modePing;
                this.add(before, row, col);
                before = char;
            } else if (char === "|" && this.m === this.modeNormal) {
                this.m = this.modeTemplate;
                before = before + char;
            } else if (char === "\"" && this.m === this.modeNormal) {
                this.m = this.modeComment;
                before = before + char;
            } else if (char === "*" && col === 1 && this.m === this.modeNormal) {
                this.m = this.modeComment;
                before = before + char;
            } else if (char === "'" && ahead === "'" && this.m === this.modeStr) {
                before = before + char + ahead;
                col = col + 1;
                raw = raw.substr(1);
            } else if ((char === "'" && this.m === this.modeStr)
                    || (char === "`" && this.m === this.modePing)
                    || (char === "|" && this.m === this.modeTemplate)) {
                before = before + char;
                this.add(before, row, col + 1);
                before = "";
                this.m = this.modeNormal;
            } else {
                before = before + char;
            }

            col = col + 1;
            raw = raw.substr(1);
        }
        this.add(before, row, col);
    }

}