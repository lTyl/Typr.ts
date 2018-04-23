"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../core/");
class Hhea {
    static parse(data, offset, length) {
        let obj = {};
        let tableVersion = _1.Bin.readFixed(data, offset);
        offset += 4;
        obj.ascender = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.descender = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.lineGap = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.advanceWidthMax = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.minLeftSideBearing = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.minRightSideBearing = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.xMaxExtent = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.caretSlopeRise = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.caretSlopeRun = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.caretOffset = _1.Bin.readShort(data, offset);
        offset += 2;
        offset += 4 * 2;
        obj.metricDataFormat = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.numberOfHMetrics = _1.Bin.readUshort(data, offset);
        offset += 2;
        return obj;
    }
}
exports.Hhea = Hhea;
//# sourceMappingURL=hhea.js.map