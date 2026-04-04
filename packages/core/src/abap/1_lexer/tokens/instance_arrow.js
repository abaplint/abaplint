"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceArrow = void 0;
const abstract_token_1 = require("./abstract_token");
class InstanceArrow extends abstract_token_1.AbstractToken {
    static railroad() {
        return "->";
    }
}
exports.InstanceArrow = InstanceArrow;
//# sourceMappingURL=instance_arrow.js.map