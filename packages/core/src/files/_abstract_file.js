"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractFile = void 0;
class AbstractFile {
    constructor(filename) {
        this.filename = filename;
    }
    getFilename() {
        return this.filename;
    }
    baseName() {
        let name = this.getFilename();
        let index = name.lastIndexOf("\\");
        if (index) {
            index = index + 1;
        }
        name = name.substring(index);
        index = name.lastIndexOf("/");
        if (index) {
            index = index + 1;
        }
        return name.substring(index);
    }
    getObjectType() {
        var _a;
        const split = this.baseName().split(".");
        return (_a = split[1]) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    }
    getObjectName() {
        const split = this.baseName().split(".");
        // handle url escaped namespace
        split[0] = split[0].replace(/%23/g, "#");
        // handle additional escaping
        split[0] = split[0].replace(/%3e/g, ">");
        split[0] = split[0].replace(/%3c/g, "<");
        // handle abapGit namespace
        split[0] = split[0].toUpperCase().replace(/#/g, "/");
        // handle AFF namespace
        split[0] = split[0].replace("(", "/");
        split[0] = split[0].replace(")", "/");
        return split[0];
    }
}
exports.AbstractFile = AbstractFile;
//# sourceMappingURL=_abstract_file.js.map