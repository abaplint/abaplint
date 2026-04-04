"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexerStream = void 0;
class LexerStream {
    constructor(raw) {
        this.offset = -1;
        this.raw = raw;
        this.row = 0;
        this.col = 0;
    }
    advance() {
        if (this.currentChar() === "\n") {
            this.col = 1;
            this.row = this.row + 1;
        }
        if (this.offset === this.raw.length) {
            this.col = this.col - 1;
            return false;
        }
        this.col = this.col + 1;
        this.offset = this.offset + 1;
        return true;
    }
    getCol() {
        return this.col;
    }
    getRow() {
        return this.row;
    }
    prevChar() {
        if (this.offset - 1 < 0) {
            return "";
        }
        return this.raw.substr(this.offset - 1, 1);
    }
    prevPrevChar() {
        if (this.offset - 2 < 0) {
            return "";
        }
        return this.raw.substr(this.offset - 2, 2);
    }
    currentChar() {
        if (this.offset < 0) {
            return "\n"; // simulate newline at start of file to handle star(*) comments
        }
        else if (this.offset >= this.raw.length) {
            return "";
        }
        return this.raw.substr(this.offset, 1);
    }
    nextChar() {
        if (this.offset + 2 > this.raw.length) {
            return "";
        }
        return this.raw.substr(this.offset + 1, 1);
    }
    nextNextChar() {
        if (this.offset + 3 > this.raw.length) {
            return this.nextChar();
        }
        return this.raw.substr(this.offset + 1, 2);
    }
    getRaw() {
        return this.raw;
    }
    getOffset() {
        return this.offset;
    }
}
exports.LexerStream = LexerStream;
//# sourceMappingURL=lexer_stream.js.map