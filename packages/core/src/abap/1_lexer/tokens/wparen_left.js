"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WParenLeft = void 0;
const abstract_token_1 = require("./abstract_token");
class WParenLeft extends abstract_token_1.AbstractToken {
    static railroad() {
        return " (";
    }
}
exports.WParenLeft = WParenLeft;
//# sourceMappingURL=wparen_left.js.map