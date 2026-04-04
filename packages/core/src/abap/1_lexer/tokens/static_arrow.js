"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticArrow = void 0;
const abstract_token_1 = require("./abstract_token");
class StaticArrow extends abstract_token_1.AbstractToken {
    static railroad() {
        return "=>";
    }
}
exports.StaticArrow = StaticArrow;
//# sourceMappingURL=static_arrow.js.map