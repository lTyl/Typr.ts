"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../core/");
class Maxp {
    static parse(data, offset, length) {
        let obj = {};
        let ver = _1.Bin.readUint(data, offset);
        offset += 4;
        obj.numGlyphs = _1.Bin.readUshort(data, offset);
        offset += 2;
        // only 1.0
        if (ver == 0x00010000) {
            obj.maxPoints = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxContours = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxCompositePoints = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxCompositeContours = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxZones = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxTwilightPoints = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxStorage = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxFunctionDefs = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxInstructionDefs = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxStackElements = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxSizeOfInstructions = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxComponentElements = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.maxComponentDepth = _1.Bin.readUshort(data, offset);
        }
        return obj;
    }
}
exports.Maxp = Maxp;
//# sourceMappingURL=maxp.js.map