"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParenLeft = void 0;
const abstract_token_1 = require("./abstract_token");
class ParenLeft extends abstract_token_1.AbstractToken {
    static railroad() {
        return "(";
    }
}
exports.ParenLeft = ParenLeft;
//# sourceMappingURL=paren_left.js.map