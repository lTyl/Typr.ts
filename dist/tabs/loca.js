"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../core/");
class Loca {
    static parse(data, offset, length, font) {
        let obj = [];
        let ver = font.head.indexToLocFormat;
        let len = font.maxp.numGlyphs + 1;
        if (ver === 0) {
            for (let i = 0; i < len; i++) {
                obj.push(_1.Bin.readUshort(data, offset + (i << 1)) << 1);
            }
        }
        if (ver === 1) {
            for (let i = 0; i < len; i++) {
                obj.push(_1.Bin.readUint(data, offset + (i << 2)));
            }
        }
        return obj;
    }
}
exports.Loca = Loca;
//# sourceMappingURL=loca.js.map