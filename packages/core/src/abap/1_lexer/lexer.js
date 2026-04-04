"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const position_1 = require("../../position");
const virtual_position_1 = require("../../virtual_position");
const tokens_1 = require("./tokens");
const lexer_buffer_1 = require("./lexer_buffer");
const lexer_stream_1 = require("./lexer_stream");
const ModeNormal = 1;
const ModePing = 2;
const ModeStr = 3;
const ModeTemplate = 4;
const ModeComment = 5;
const ModePragma = 6;
class Lexer {
    run(file, virtual) {
        this.virtual = virtual;
        this.tokens = [];
        this.m = ModeNormal;
        this.process(file.getRaw());
        return { file, tokens: this.tokens };
    }
    add() {
        const s = this.buffer.get().trim();
        if (s.length > 0) {
            const col = this.stream.getCol();
            const row = this.stream.getRow();
            let whiteBefore = false;
            if (this.stream.getOffset() - s.length >= 0) {
                const prev = this.stream.getRaw().substr(this.stream.getOffset() - s.length, 1);
                if (prev === " " || prev === "\n" || prev === "\t" || prev === ":") {
                    whiteBefore = true;
                }
            }
            let whiteAfter = false;
            const next = this.stream.nextChar();
            if (next === " " || next === "\n" || next === "\t" || next === ":" || next === "," || next === "." || next === "" || next === "\"") {
                whiteAfter = true;
            }
            let pos = new position_1.Position(row, col - s.length);
            if (this.virtual) {
                pos = new virtual_position_1.VirtualPosition(this.virtual, pos.getRow(), pos.getCol());
            }
            let tok = undefined;
            if (this.m === ModeComment) {
                tok = new tokens_1.Comment(pos, s);
            }
            else if (this.m === ModePing || this.m === ModeStr) {
                tok = new tokens_1.StringToken(pos, s);
            }
            else if (this.m === ModeTemplate) {
                const first = s.charAt(0);
                const last = s.charAt(s.length - 1);
                if (first === "|" && last === "|") {
                    tok = new tokens_1.StringTemplate(pos, s);
                }
                else if (first === "|" && last === "{" && whiteAfter === true) {
                    tok = new tokens_1.StringTemplateBegin(pos, s);
                }
                else if (first === "}" && last === "|" && whiteBefore === true) {
                    tok = new tokens_1.StringTemplateEnd(pos, s);
                }
                else if (first === "}" && last === "{" && whiteAfter === true && whiteBefore === true) {
                    tok = new tokens_1.StringTemplateMiddle(pos, s);
                }
                else {
                    tok = new tokens_1.Identifier(pos, s);
                }
            }
            else if (s.length > 2 && s.substr(0, 2) === "##") {
                tok = new tokens_1.Pragma(pos, s);
            }
            else if (s.length === 1) {
                if (s === "." || s === ",") {
                    tok = new tokens_1.Punctuation(pos, s);
                }
                else if (s === "[") {
                    if (whiteBefore === true && whiteAfter === true) {
                        tok = new tokens_1.WBracketLeftW(pos, s);
                    }
                    else if (whiteBefore === true) {
                        tok = new tokens_1.WBracketLeft(pos, s);
                    }
                    else if (whiteAfter === true) {
                        tok = new tokens_1.BracketLeftW(pos, s);
                    }
                    else {
                        tok = new tokens_1.BracketLeft(pos, s);
                    }
                }
                else if (s === "(") {
                    if (whiteBefore === true && whiteAfter === true) {
                        tok = new tokens_1.WParenLeftW(pos, s);
                    }
                    else if (whiteBefore === true) {
                        tok = new tokens_1.WParenLeft(pos, s);
                    }
                    else if (whiteAfter === true) {
                        tok = new tokens_1.ParenLeftW(pos, s);
                    }
                    else {
                        tok = new tokens_1.ParenLeft(pos, s);
                    }
                }
                else if (s === "]") {
                    if (whiteBefore === true && whiteAfter === true) {
                        tok = new tokens_1.WBracketRightW(pos, s);
                    }
                    else if (whiteBefore === true) {
                        tok = new tokens_1.WBracketRight(pos, s);
                    }
                    else if (whiteAfter === true) {
                        tok = new tokens_1.BracketRightW(pos, s);
                    }
                    else {
                        tok = new tokens_1.BracketRight(pos, s);
                    }
                }
                else if (s === ")") {
                    if (whiteBefore === true && whiteAfter === true) {
                        tok = new tokens_1.WParenRightW(pos, s);
                    }
                    else if (whiteBefore === true) {
                        tok = new tokens_1.WParenRight(pos, s);
                    }
                    else if (whiteAfter === true) {
                        tok = new tokens_1.ParenRightW(pos, s);
                    }
                    else {
                        tok = new tokens_1.ParenRight(pos, s);
                    }
                }
                else if (s === "-") {
                    if (whiteBefore === true && whiteAfter === true) {
                        tok = new tokens_1.WDashW(pos, s);
                    }
                    else if (whiteBefore === true) {
                        tok = new tokens_1.WDash(pos, s);
                    }
                    else if (whiteAfter === true) {
                        tok = new tokens_1.DashW(pos, s);
                    }
                    else {
                        tok = new tokens_1.Dash(pos, s);
                    }
                }
                else if (s === "+") {
                    if (whiteBefore === true && whiteAfter === true) {
                        tok = new tokens_1.WPlusW(pos, s);
                    }
                    else if (whiteBefore === true) {
                        tok = new tokens_1.WPlus(pos, s);
                    }
                    else if (whiteAfter === true) {
                        tok = new tokens_1.PlusW(pos, s);
                    }
                    else {
                        tok = new tokens_1.Plus(pos, s);
                    }
                }
                else if (s === "@") {
                    if (whiteBefore === true && whiteAfter === true) {
                        tok = new tokens_1.WAtW(pos, s);
                    }
                    else if (whiteBefore === true) {
                        tok = new tokens_1.WAt(pos, s);
                    }
                    else if (whiteAfter === true) {
                        tok = new tokens_1.AtW(pos, s);
                    }
                    else {
                        tok = new tokens_1.At(pos, s);
                    }
                }
            }
            else if (s.length === 2) {
                if (s === "->") {
                    if (whiteBefore === true && whiteAfter === true) {
                        tok = new tokens_1.WInstanceArrowW(pos, s);
                    }
                    else if (whiteBefore === true) {
                        tok = new tokens_1.WInstanceArrow(pos, s);
                    }
                    else if (whiteAfter === true) {
                        tok = new tokens_1.InstanceArrowW(pos, s);
                    }
                    else {
                        tok = new tokens_1.InstanceArrow(pos, s);
                    }
                }
                else if (s === "=>") {
                    if (whiteBefore === true && whiteAfter === true) {
                        tok = new tokens_1.WStaticArrowW(pos, s);
                    }
                    else if (whiteBefore === true) {
                        tok = new tokens_1.WStaticArrow(pos, s);
                    }
                    else if (whiteAfter === true) {
                        tok = new tokens_1.StaticArrowW(pos, s);
                    }
                    else {
                        tok = new tokens_1.StaticArrow(pos, s);
                    }
                }
            }
            if (tok === undefined) {
                tok = new tokens_1.Identifier(pos, s);
            }
            this.tokens.push(tok);
        }
        this.buffer.clear();
    }
    process(raw) {
        this.stream = new lexer_stream_1.LexerStream(raw.replace(/\r/g, ""));
        this.buffer = new lexer_buffer_1.LexerBuffer();
        const splits = {};
        splits[" "] = true;
        splits[":"] = true;
        splits["."] = true;
        splits[","] = true;
        splits["-"] = true;
        splits["+"] = true;
        splits["("] = true;
        splits[")"] = true;
        splits["["] = true;
        splits["]"] = true;
        splits["\t"] = true;
        splits["\n"] = true;
        const bufs = {};
        bufs["."] = true;
        bufs[","] = true;
        bufs[":"] = true;
        bufs["("] = true;
        bufs[")"] = true;
        bufs["["] = true;
        bufs["]"] = true;
        bufs["+"] = true;
        bufs["@"] = true;
        for (;;) {
            const current = this.stream.currentChar();
            const buf = this.buffer.add(current);
            const ahead = this.stream.nextChar();
            const aahead = this.stream.nextNextChar();
            if (this.m === ModeNormal) {
                if (splits[ahead]) {
                    this.add();
                }
                else if (ahead === "'") {
                    // start string
                    this.add();
                    this.m = ModeStr;
                }
                else if (ahead === "|" || ahead === "}") {
                    // start template
                    this.add();
                    this.m = ModeTemplate;
                }
                else if (ahead === "`") {
                    // start ping
                    this.add();
                    this.m = ModePing;
                }
                else if (aahead === "##") {
                    // start pragma
                    this.add();
                    this.m = ModePragma;
                }
                else if (ahead === "\""
                    || (ahead === "*" && current === "\n")) {
                    // start comment
                    this.add();
                    this.m = ModeComment;
                }
                else if (ahead === "@" && buf.trim().length === 0) {
                    this.add();
                }
                else if (aahead === "->"
                    || aahead === "=>") {
                    this.add();
                }
                else if (current === ">"
                    && ahead !== " "
                    && (this.stream.prevChar() === "-" || this.stream.prevChar() === "=")) {
                    // arrows
                    this.add();
                }
                else if (buf.length === 1
                    && (bufs[buf]
                        || (buf === "-" && ahead !== ">"))) {
                    this.add();
                }
            }
            else if (this.m === ModePragma && (ahead === "," || ahead === ":" || ahead === "." || ahead === " " || ahead === "\n")) {
                // end of pragma
                this.add();
                this.m = ModeNormal;
            }
            else if (this.m === ModePing
                && buf.length > 1
                && current === "`"
                && aahead !== "``"
                && ahead !== "`"
                && this.buffer.countIsEven("`")) {
                // end of ping
                this.add();
                if (ahead === `"`) {
                    this.m = ModeComment;
                }
                else {
                    this.m = ModeNormal;
                }
            }
            else if (this.m === ModeTemplate
                && buf.length > 1
                && (current === "|" || current === "{")
                && (this.stream.prevChar() !== "\\" || this.stream.prevPrevChar() === "\\\\")) {
                // end of template
                this.add();
                this.m = ModeNormal;
            }
            else if (this.m === ModeTemplate
                && ahead === "}"
                && current !== "\\") {
                this.add();
            }
            else if (this.m === ModeStr
                && current === "'"
                && buf.length > 1
                && aahead !== "''"
                && ahead !== "'"
                && this.buffer.countIsEven("'")) {
                // end of string
                this.add();
                if (ahead === "\"") {
                    this.m = ModeComment;
                }
                else {
                    this.m = ModeNormal;
                }
            }
            else if (ahead === "\n" && this.m !== ModeTemplate) {
                this.add();
                this.m = ModeNormal;
            }
            else if (this.m === ModeTemplate && current === "\n") {
                this.add();
            }
            if (!this.stream.advance()) {
                break;
            }
        }
        this.add();
    }
}
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map