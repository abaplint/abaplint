"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BracketRight = void 0;
const abstract_token_1 = require("./abstract_token");
class BracketRight extends abstract_token_1.AbstractToken {
    static railroad() {
        return "]";
    }
}
exports.BracketRight = BracketRight;
//# sourceMappingURL=bracket_right.js.map