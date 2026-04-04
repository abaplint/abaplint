"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractToken = void 0;
const position_1 = require("../../../position");
class AbstractToken {
    constructor(start, str) {
        this.start = start;
        this.str = str;
    }
    // special function, for debugging purposes, see https://github.com/abaplint/abaplint/pull/3137
    [Symbol.for("debug.description")]() {
        return `${this.constructor.name} ${this.str}`;
    }
    getStr() {
        return this.str;
    }
    getRow() {
        return this.start.getRow();
    }
    getCol() {
        return this.start.getCol();
    }
    getStart() {
        return this.start;
    }
    getEnd() {
        return new position_1.Position(this.start.getRow(), this.start.getCol() + this.str.length);
    }
}
exports.AbstractToken = AbstractToken;
//# sourceMappingURL=abstract_token.js.map