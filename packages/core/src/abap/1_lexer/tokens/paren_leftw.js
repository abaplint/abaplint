"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParenLeftW = void 0;
const abstract_token_1 = require("./abstract_token");
class ParenLeftW extends abstract_token_1.AbstractToken {
    static railroad() {
        return "( ";
    }
}
exports.ParenLeftW = ParenLeftW;
//# sourceMappingURL=paren_leftw.js.map