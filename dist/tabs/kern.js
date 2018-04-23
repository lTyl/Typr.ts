"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../core/");
class Kern {
    static parse(data, offset, length, font) {
        let version = _1.Bin.readUshort(data, offset);
        offset += 2;
        if (version === 1) {
            return Kern.parseV1(data, offset - 2, length, font);
        }
        let nTables = _1.Bin.readUshort(data, offset);
        offset += 2;
        let map = { glyph1: [], rval: [] };
        for (let i = 0; i < nTables; i++) {
            offset += 2; // skip version
            let length = _1.Bin.readUshort(data, offset);
            offset += 2;
            let coverage = _1.Bin.readUshort(data, offset);
            offset += 2;
            let format = coverage >>> 8;
            /* I have seen format 128 once, that's why I do */ format &= 0xf;
            if (format == 0) {
                offset = Kern.readFormat0(data, offset, map);
            }
            else
                throw "unknown kern table format: " + format;
        }
        return map;
    }
    static parseV1(data, offset, length, font) {
        let version = _1.Bin.readFixed(data, offset);
        offset += 4;
        let nTables = _1.Bin.readUint(data, offset);
        offset += 4;
        let map = { glyph1: [], rval: [] };
        for (let i = 0; i < nTables; i++) {
            let length = _1.Bin.readUint(data, offset);
            offset += 4;
            let coverage = _1.Bin.readUshort(data, offset);
            offset += 2;
            let tupleIndex = _1.Bin.readUshort(data, offset);
            offset += 2;
            let format = coverage >>> 8;
            /* I have seen format 128 once, that's why I do */ format &= 0xf;
            if (format == 0)
                offset = Kern.readFormat0(data, offset, map);
            else
                throw "unknown kern table format: " + format;
        }
        return map;
    }
    static readFormat0(data, offset, map) {
        let pleft = -1;
        let nPairs = _1.Bin.readUshort(data, offset);
        offset += 2;
        let searchRange = _1.Bin.readUshort(data, offset);
        offset += 2;
        let entrySelector = _1.Bin.readUshort(data, offset);
        offset += 2;
        let rangeShift = _1.Bin.readUshort(data, offset);
        offset += 2;
        for (let j = 0; j < nPairs; j++) {
            let left = _1.Bin.readUshort(data, offset);
            offset += 2;
            let right = _1.Bin.readUshort(data, offset);
            offset += 2;
            let value = _1.Bin.readShort(data, offset);
            offset += 2;
            if (left !== pleft) {
                map.glyph1.push(left);
                map.rval.push({ glyph2: [], vals: [] });
            }
            let rval = map.rval[map.rval.length - 1];
            rval.glyph2.push(right);
            rval.vals.push(value);
            pleft = left;
        }
        return offset;
    }
}
exports.Kern = Kern;
//# sourceMappingURL=kern.js.map