"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WBracketRight = void 0;
const abstract_token_1 = require("./abstract_token");
class WBracketRight extends abstract_token_1.AbstractToken {
    static railroad() {
        return " ]";
    }
}
exports.WBracketRight = WBracketRight;
//# sourceMappingURL=wbracket_right.js.map