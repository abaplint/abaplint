"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BracketLeft = void 0;
const abstract_token_1 = require("./abstract_token");
class BracketLeft extends abstract_token_1.AbstractToken {
    static railroad() {
        return "[";
    }
}
exports.BracketLeft = BracketLeft;
//# sourceMappingURL=bracket_left.js.map