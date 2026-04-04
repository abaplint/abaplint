"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WPlus = void 0;
const abstract_token_1 = require("./abstract_token");
class WPlus extends abstract_token_1.AbstractToken {
    static railroad() {
        return " +";
    }
}
exports.WPlus = WPlus;
//# sourceMappingURL=wplus.js.map