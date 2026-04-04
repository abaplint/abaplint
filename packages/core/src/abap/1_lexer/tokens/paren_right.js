"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParenRight = void 0;
const abstract_token_1 = require("./abstract_token");
class ParenRight extends abstract_token_1.AbstractToken {
    static railroad() {
        return ")";
    }
}
exports.ParenRight = ParenRight;
//# sourceMappingURL=paren_right.js.map