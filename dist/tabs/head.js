"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../core/");
class Head {
    static parse(data, offset, length) {
        let obj = {};
        let tableVersion = _1.Bin.readFixed(data, offset);
        offset += 4;
        obj.fontRevision = _1.Bin.readFixed(data, offset);
        offset += 4;
        let checkSumAdjustment = _1.Bin.readUint(data, offset);
        offset += 4;
        let magicNumber = _1.Bin.readUint(data, offset);
        offset += 4;
        obj.flags = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.unitsPerEm = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.created = _1.Bin.readUint64(data, offset);
        offset += 8;
        obj.modified = _1.Bin.readUint64(data, offset);
        offset += 8;
        obj.xMin = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.yMin = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.xMax = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.yMax = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.macStyle = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.lowestRecPPEM = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.fontDirectionHint = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.indexToLocFormat = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.glyphDataFormat = _1.Bin.readShort(data, offset);
        offset += 2;
        return obj;
    }
}
exports.Head = Head;
//# sourceMappingURL=head.js.map