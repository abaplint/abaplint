"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Position = void 0;
// first position is (1,1)
class Position {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
    getCol() {
        return this.col;
    }
    getRow() {
        return this.row;
    }
    isAfter(p) {
        return this.row > p.row || (this.row === p.row && this.col >= p.col);
    }
    equals(p) {
        return this.row === p.getRow() && this.col === p.getCol();
    }
    isBefore(p) {
        return this.row < p.row || (this.row === p.row && this.col < p.col);
    }
    isBetween(p1, p2) {
        return this.isAfter(p1) && this.isBefore(p2);
    }
}
exports.Position = Position;
//# sourceMappingURL=position.js.map