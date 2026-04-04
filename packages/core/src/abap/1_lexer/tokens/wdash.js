"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WDash = void 0;
const abstract_token_1 = require("./abstract_token");
class WDash extends abstract_token_1.AbstractToken {
    static railroad() {
        return " -";
    }
}
exports.WDash = WDash;
//# sourceMappingURL=wdash.js.map