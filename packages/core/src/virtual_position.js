"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualPosition = void 0;
const position_1 = require("./position");
/** used for macro calls */
class VirtualPosition extends position_1.Position {
    constructor(virtual, row, col) {
        super(virtual.getRow(), virtual.getCol());
        this.vrow = row;
        this.vcol = col;
    }
    equals(p) {
        if (!(p instanceof VirtualPosition)) {
            return false;
        }
        const casted = p;
        return super.equals(this) && this.vrow === casted.vrow && this.vcol === casted.vcol;
    }
    isAfter(p) {
        if (p instanceof VirtualPosition) {
            if (this.getRow() > p.getRow()) {
                return true;
            }
            if (this.getRow() === p.getRow() && this.getCol() > p.getCol()) {
                return true;
            }
            if (this.getRow() === p.getRow() && this.getCol() === p.getCol() && this.vrow > p.vrow) {
                return true;
            }
            if (this.getRow() === p.getRow() && this.getCol() === p.getCol() && this.vrow === p.vrow && this.vcol > p.vcol) {
                return true;
            }
            return false;
        }
        else {
            return super.isAfter(p);
        }
    }
}
exports.VirtualPosition = VirtualPosition;
//# sourceMappingURL=virtual_position.js.map