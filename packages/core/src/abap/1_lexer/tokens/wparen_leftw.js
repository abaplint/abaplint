"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WParenLeftW = void 0;
const abstract_token_1 = require("./abstract_token");
class WParenLeftW extends abstract_token_1.AbstractToken {
    static railroad() {
        return " ( ";
    }
}
exports.WParenLeftW = WParenLeftW;
//# sourceMappingURL=wparen_leftw.js.map