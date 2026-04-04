"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WParenRight = void 0;
const abstract_token_1 = require("./abstract_token");
class WParenRight extends abstract_token_1.AbstractToken {
    static railroad() {
        return " )";
    }
}
exports.WParenRight = WParenRight;
//# sourceMappingURL=wparen_right.js.map