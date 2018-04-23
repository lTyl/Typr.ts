"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../core/");
class Cmap {
    static parse(data, offset, length) {
        data = new Uint8Array(data.buffer, offset, length);
        offset = 0;
        let offset0 = offset;
        let obj = {};
        let version = _1.Bin.readUshort(data, offset);
        offset += 2;
        let numTables = _1.Bin.readUshort(data, offset);
        offset += 2;
        let offs = [];
        obj.tables = [];
        for (let i = 0; i < numTables; i++) {
            let platformID = _1.Bin.readUshort(data, offset);
            offset += 2;
            let encodingID = _1.Bin.readUshort(data, offset);
            offset += 2;
            let noffset = _1.Bin.readUint(data, offset);
            offset += 4;
            let id = "p" + platformID + "e" + encodingID;
            var tind = offs.indexOf(noffset);
            if (tind === -1) {
                tind = obj.tables.length;
                let subt;
                offs.push(noffset);
                let format = _1.Bin.readUshort(data, noffset);
                if (format === 0) {
                    subt = Cmap.parse0(data, noffset);
                }
                else if (format === 4) {
                    subt = Cmap.parse4(data, noffset);
                }
                else if (format === 6) {
                    subt = Cmap.parse6(data, noffset);
                }
                else if (format === 12) {
                    subt = Cmap.parse12(data, noffset);
                }
                else {
                    console.log("unknown format: " + format, platformID, encodingID, noffset);
                }
                obj.tables.push(subt);
            }
            if (obj[id] != null) {
                throw "multiple tables for one platform + encoding";
            }
            obj[id] = tind;
        }
        return obj;
    }
    static parse0(data, offset) {
        let obj = {};
        obj.format = _1.Bin.readUshort(data, offset);
        offset += 2;
        let len = _1.Bin.readUshort(data, offset);
        offset += 2;
        let lang = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.map = [];
        for (let i = 0; i < len - 6; i++) {
            obj.map.push(data[offset + i]);
        }
        return obj;
    }
    static parse4(data, offset) {
        let offset0 = offset;
        let obj = {};
        obj.format = _1.Bin.readUshort(data, offset);
        offset += 2;
        let length = _1.Bin.readUshort(data, offset);
        offset += 2;
        let language = _1.Bin.readUshort(data, offset);
        offset += 2;
        let segCountX2 = _1.Bin.readUshort(data, offset);
        offset += 2;
        let segCount = segCountX2 / 2;
        obj.searchRange = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.entrySelector = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.rangeShift = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.endCount = _1.Bin.readUshorts(data, offset, segCount);
        offset += segCount * 2;
        offset += 2;
        obj.startCount = _1.Bin.readUshorts(data, offset, segCount);
        offset += segCount * 2;
        obj.idDelta = [];
        for (let i = 0; i < segCount; i++) {
            obj.idDelta.push(_1.Bin.readShort(data, offset));
            offset += 2;
        }
        obj.idRangeOffset = _1.Bin.readUshorts(data, offset, segCount);
        offset += segCount * 2;
        obj.glyphIdArray = [];
        while (offset < offset0 + length) {
            obj.glyphIdArray.push(_1.Bin.readUshort(data, offset));
            offset += 2;
        }
        return obj;
    }
    static parse6(data, offset) {
        let offset0 = offset;
        let obj = {};
        obj.format = _1.Bin.readUshort(data, offset);
        offset += 2;
        let length = _1.Bin.readUshort(data, offset);
        offset += 2;
        let language = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.firstCode = _1.Bin.readUshort(data, offset);
        offset += 2;
        let entryCount = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.glyphIdArray = [];
        for (let i = 0; i < entryCount; i++) {
            obj.glyphIdArray.push(_1.Bin.readUshort(data, offset));
            offset += 2;
        }
        return obj;
    }
    static parse12(data, offset) {
        let offset0 = offset;
        let obj = {};
        obj.format = _1.Bin.readUshort(data, offset);
        offset += 2;
        offset += 2;
        let length = _1.Bin.readUint(data, offset);
        offset += 4;
        let lang = _1.Bin.readUint(data, offset);
        offset += 4;
        let nGroups = _1.Bin.readUint(data, offset);
        offset += 4;
        obj.groups = [];
        for (let i = 0; i < nGroups; i++) {
            let off = offset + i * 12;
            let startCharCode = _1.Bin.readUint(data, off + 0);
            let endCharCode = _1.Bin.readUint(data, off + 4);
            let startGlyphID = _1.Bin.readUint(data, off + 8);
            obj.groups.push([startCharCode, endCharCode, startGlyphID]);
        }
        return obj;
    }
}
exports.Cmap = Cmap;
//# sourceMappingURL=cmap.js.map