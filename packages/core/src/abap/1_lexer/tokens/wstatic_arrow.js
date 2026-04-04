"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WStaticArrow = void 0;
const abstract_token_1 = require("./abstract_token");
class WStaticArrow extends abstract_token_1.AbstractToken {
    static railroad() {
        return " =>";
    }
}
exports.WStaticArrow = WStaticArrow;
//# sourceMappingURL=wstatic_arrow.js.map