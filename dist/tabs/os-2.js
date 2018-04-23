"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../core/");
class OS2 {
    static parse(data, offset, length) {
        let ver = _1.Bin.readUshort(data, offset);
        offset += 2;
        let obj = {};
        if (ver === 0) {
            OS2.version0(data, offset, obj);
        }
        else if (ver === 1) {
            OS2.version1(data, offset, obj);
        }
        else if (ver === 2 || ver === 3 || ver === 4) {
            OS2.version2(data, offset, obj);
        }
        else if (ver === 5) {
            OS2.version5(data, offset, obj);
        }
        else
            throw "unknown OS/2 table version: " + ver;
        return obj;
    }
    static version0(data, offset, obj) {
        obj.xAvgCharWidth = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.usWeightClass = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.usWidthClass = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.fsType = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.ySubscriptXSize = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.ySubscriptYSize = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.ySubscriptXOffset = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.ySubscriptYOffset = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.ySuperscriptXSize = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.ySuperscriptYSize = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.ySuperscriptXOffset = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.ySuperscriptYOffset = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.yStrikeoutSize = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.yStrikeoutPosition = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.sFamilyClass = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.panose = _1.Bin.readBytes(data, offset, 10);
        offset += 10;
        obj.ulUnicodeRange1 = _1.Bin.readUint(data, offset);
        offset += 4;
        obj.ulUnicodeRange2 = _1.Bin.readUint(data, offset);
        offset += 4;
        obj.ulUnicodeRange3 = _1.Bin.readUint(data, offset);
        offset += 4;
        obj.ulUnicodeRange4 = _1.Bin.readUint(data, offset);
        offset += 4;
        obj.achVendID = [_1.Bin.readInt8(data, offset), _1.Bin.readInt8(data, offset + 1), _1.Bin.readInt8(data, offset + 2), _1.Bin.readInt8(data, offset + 3)];
        offset += 4;
        obj.fsSelection = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.usFirstCharIndex = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.usLastCharIndex = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.sTypoAscender = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.sTypoDescender = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.sTypoLineGap = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.usWinAscent = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.usWinDescent = _1.Bin.readUshort(data, offset);
        offset += 2;
        return offset;
    }
    static version1(data, offset, obj) {
        offset = OS2.version0(data, offset, obj);
        obj.ulCodePageRange1 = _1.Bin.readUint(data, offset);
        offset += 4;
        obj.ulCodePageRange2 = _1.Bin.readUint(data, offset);
        offset += 4;
        return offset;
    }
    static version2(data, offset, obj) {
        offset = OS2.version1(data, offset, obj);
        obj.sxHeight = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.sCapHeight = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.usDefault = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.usBreak = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.usMaxContext = _1.Bin.readUshort(data, offset);
        offset += 2;
        return offset;
    }
    static version5(data, offset, obj) {
        offset = OS2.version2(data, offset, obj);
        obj.usLowerOpticalPointSize = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.usUpperOpticalPointSize = _1.Bin.readUshort(data, offset);
        offset += 2;
        return offset;
    }
}
exports.OS2 = OS2;
//# sourceMappingURL=os-2.js.map