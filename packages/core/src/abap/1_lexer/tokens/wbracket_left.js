"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WBracketLeft = void 0;
const abstract_token_1 = require("./abstract_token");
class WBracketLeft extends abstract_token_1.AbstractToken {
    static railroad() {
        return " [";
    }
}
exports.WBracketLeft = WBracketLeft;
//# sourceMappingURL=wbracket_left.js.map