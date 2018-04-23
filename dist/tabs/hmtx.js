"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../core/");
class Hmtx {
    static parse(data, offset, length, font) {
        let obj = {};
        obj.aWidth = [];
        obj.lsBearing = [];
        let aw = 0, lsb = 0;
        for (let i = 0; i < font.maxp.numGlyphs; i++) {
            if (i < font.hhea.numberOfHMetrics) {
                aw = _1.Bin.readUshort(data, offset);
                offset += 2;
                lsb = _1.Bin.readShort(data, offset);
                offset += 2;
            }
            obj.aWidth.push(aw);
            obj.lsBearing.push(lsb);
        }
        return obj;
    }
}
exports.Hmtx = Hmtx;
//# sourceMappingURL=hmtx.js.map