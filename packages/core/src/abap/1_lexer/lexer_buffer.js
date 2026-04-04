"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexerBuffer = void 0;
class LexerBuffer {
    constructor() {
        this.buf = "";
    }
    add(s) {
        this.buf = this.buf + s;
        return this.buf;
    }
    get() {
        return this.buf;
    }
    clear() {
        this.buf = "";
    }
    countIsEven(char) {
        let count = 0;
        for (let i = 0; i < this.buf.length; i += 1) {
            if (this.buf.charAt(i) === char) {
                count += 1;
            }
        }
        return count % 2 === 0;
    }
}
exports.LexerBuffer = LexerBuffer;
//# sourceMappingURL=lexer_buffer.js.map