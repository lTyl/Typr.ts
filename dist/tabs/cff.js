"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../core/");
class CFF {
    static parse(data, offset, length) {
        data = new Uint8Array(data.buffer, offset, length);
        offset = 0;
        // Header
        let major = data[offset];
        offset++;
        let minor = data[offset];
        offset++;
        let hdrSize = data[offset];
        offset++;
        let offsize = data[offset];
        offset++;
        // Name INDEX
        let ninds = [];
        offset = CFF.readIndex(data, offset, ninds);
        let names = [];
        for (let i = 0; i < ninds.length - 1; i++) {
            names.push(_1.Bin.readASCII(data, offset + ninds[i], ninds[i + 1] - ninds[i]));
        }
        offset += ninds[ninds.length - 1];
        // Top DICT INDEX
        let tdinds = [];
        offset = CFF.readIndex(data, offset, tdinds);
        // Top DICT Data
        let topDicts = [];
        for (let i = 0; i < tdinds.length - 1; i++) {
            topDicts.push(CFF.readDict(data, offset + tdinds[i], offset + tdinds[i + 1]));
        }
        offset += tdinds[tdinds.length - 1];
        let topdict = topDicts[0];
        // String INDEX
        let sinds = [];
        offset = CFF.readIndex(data, offset, sinds);
        // String Data
        let strings = [];
        for (let i = 0; i < sinds.length - 1; i++) {
            strings.push(_1.Bin.readASCII(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
        }
        offset += sinds[sinds.length - 1];
        // Global Subr INDEX  (subroutines)
        CFF.readSubrs(data, offset, topdict);
        // charstrings
        if (topdict.CharStrings) {
            offset = topdict.CharStrings;
            let sinds = [];
            offset = CFF.readIndex(data, offset, sinds);
            let cstr = [];
            for (let i = 0; i < sinds.length - 1; i++) {
                cstr.push(_1.Bin.readBytes(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
            }
            topdict.CharStrings = cstr;
        }
        // Encoding
        if (topdict.Encoding) {
            topdict.Encoding = CFF.readEncoding(data, topdict.Encoding, topdict.CharStrings.length);
        }
        // charset
        if (topdict.charset) {
            topdict.charset = CFF.readCharset(data, topdict.charset, topdict.CharStrings.length);
        }
        if (topdict.Private) {
            offset = topdict.Private[1];
            topdict.Private = CFF.readDict(data, offset, offset + topdict.Private[0]);
            if (topdict.Private.Subrs) {
                CFF.readSubrs(data, offset + topdict.Private.Subrs, topdict.Private);
            }
        }
        let obj = {};
        for (let p in topdict) {
            if (["FamilyName", "FullName", "Notice", "version", "Copyright"].indexOf(p) != -1) {
                obj[p] = strings[topdict[p] - 426 + 35];
            }
            else {
                obj[p] = topdict[p];
            }
        }
        //console.log(obj);
        return obj;
    }
    static glyphBySE(cff, charcode) {
        if (charcode < 0 || charcode > 255)
            return -1;
        return CFF.glyphByUnicode(cff, CFF.tableSE[charcode]);
    }
    static readSubrs(data, offset, obj) {
        let gsubinds = [];
        offset = CFF.readIndex(data, offset, gsubinds);
        let bias, nSubrs = gsubinds.length;
        if (false) { }
        else if (nSubrs < 1240) {
            bias = 107;
        }
        else if (nSubrs < 33900) {
            bias = 1131;
        }
        else {
            bias = 32768;
        }
        obj.Bias = bias;
        obj.Subrs = [];
        for (let i = 0; i < gsubinds.length - 1; i++) {
            obj.Subrs.push(_1.Bin.readBytes(data, offset + gsubinds[i], gsubinds[i + 1] - gsubinds[i]));
        }
        //offset += gsubinds[gsubinds.length-1];
    }
    static glyphByUnicode(cff, code) {
        for (let i = 0; i < cff.charset.length; i++) {
            if (cff.charset[i] == code) {
                return i;
            }
        }
        return -1;
    }
    static readEncoding(data, offset, num) {
        let array = ['.notdef'];
        let format = data[offset];
        offset++;
        if (format === 0) {
            let nCodes = data[offset];
            offset++;
            for (let i = 0; i < nCodes; i++) {
                array.push(data[offset + i]);
            }
        }
        else
            throw "error: unknown encoding format: " + format;
        return array;
    }
    static readCharset(data, offset, num) {
        let charset = ['.notdef'];
        let format = data[offset];
        offset++;
        if (format === 0) {
            for (let i = 0; i < num; i++) {
                let first = _1.Bin.readUshort(data, offset);
                offset += 2;
                charset.push(first);
            }
        }
        else if (format === 1 || format === 2) {
            while (charset.length < num) {
                let first = _1.Bin.readUshort(data, offset);
                offset += 2;
                let nLeft = 0;
                if (format === 1) {
                    nLeft = data[offset];
                    offset++;
                }
                else {
                    nLeft = _1.Bin.readUshort(data, offset);
                    offset += 2;
                }
                for (let i = 0; i <= nLeft; i++) {
                    charset.push(first);
                    first++;
                }
            }
        }
        else
            throw "error: format: " + format;
        return charset;
    }
    static readIndex(data, offset, inds) {
        let count = _1.Bin.readUshort(data, offset);
        offset += 2;
        let offsize = data[offset];
        offset++;
        if (offsize === 1) {
            for (let i = 0; i < count + 1; i++) {
                inds.push(data[offset + i]);
            }
        }
        else if (offsize === 2) {
            for (let i = 0; i < count + 1; i++) {
                inds.push(_1.Bin.readUshort(data, offset + i * 2));
            }
        }
        else if (offsize === 3) {
            for (let i = 0; i < count + 1; i++) {
                inds.push(_1.Bin.readUint(data, offset + i * 3 - 1) & 0x00ffffff);
            }
        }
        else if (count != 0) {
            throw "unsupported offset size: " + offsize + ", count: " + count;
        }
        offset += (count + 1) * offsize;
        return offset - 1;
    }
    static getCharString(data, offset, o) {
        let b0 = data[offset], b1 = data[offset + 1], b2 = data[offset + 2], b3 = data[offset + 3], b4 = data[offset + 4];
        let vs = 1;
        let op = null, val = null;
        // operand
        if (b0 <= 20) {
            op = b0;
            vs = 1;
        }
        if (b0 == 12) {
            op = b0 * 100 + b1;
            vs = 2;
        }
        //if(b0==19 || b0==20) { op = b0/*+" "+b1*/;  vs=2; }
        if (21 <= b0 && b0 <= 27) {
            op = b0;
            vs = 1;
        }
        if (b0 == 28) {
            val = _1.Bin.readShort(data, offset + 1);
            vs = 3;
        }
        if (29 <= b0 && b0 <= 31) {
            op = b0;
            vs = 1;
        }
        if (32 <= b0 && b0 <= 246) {
            val = b0 - 139;
            vs = 1;
        }
        if (247 <= b0 && b0 <= 250) {
            val = (b0 - 247) * 256 + b1 + 108;
            vs = 2;
        }
        if (251 <= b0 && b0 <= 254) {
            val = -(b0 - 251) * 256 - b1 - 108;
            vs = 2;
        }
        if (b0 == 255) {
            val = _1.Bin.readInt(data, offset + 1) / 0xffff;
            vs = 5;
        }
        o.val = val != null ? val : "o" + op;
        o.size = vs;
    }
    static readCharString(data, offset, length) {
        let end = offset + length;
        let arr = [];
        while (offset < end) {
            let b0 = data[offset], b1 = data[offset + 1], b2 = data[offset + 2], b3 = data[offset + 3], b4 = data[offset + 4];
            let vs = 1;
            let op = null, val = null;
            // operand
            if (b0 <= 20) {
                op = b0;
                vs = 1;
            }
            if (b0 === 12) {
                op = b0 * 100 + b1;
                vs = 2;
            }
            if (b0 === 19 || b0 === 20) {
                op = b0 /*+" "+b1*/;
                vs = 2;
            }
            if (21 <= b0 && b0 <= 27) {
                op = b0;
                vs = 1;
            }
            if (b0 === 28) {
                val = _1.Bin.readShort(data, offset + 1);
                vs = 3;
            }
            if (29 <= b0 && b0 <= 31) {
                op = b0;
                vs = 1;
            }
            if (32 <= b0 && b0 <= 246) {
                val = b0 - 139;
                vs = 1;
            }
            if (247 <= b0 && b0 <= 250) {
                val = (b0 - 247) * 256 + b1 + 108;
                vs = 2;
            }
            if (251 <= b0 && b0 <= 254) {
                val = -(b0 - 251) * 256 - b1 - 108;
                vs = 2;
            }
            if (b0 === 255) {
                val = _1.Bin.readInt(data, offset + 1) / 0xffff;
                vs = 5;
            }
            arr.push(val !== null ? val : "o" + op);
            offset += vs;
            //var cv = arr[arr.length-1];
            //if(cv==undefined) throw "error";
            //console.log()
        }
        return arr;
    }
    static readDict(data, offset, end) {
        let dict = {};
        let carr = [];
        while (offset < end) {
            let b0 = data[offset], b1 = data[offset + 1], b2 = data[offset + 2], b3 = data[offset + 3], b4 = data[offset + 4];
            let vs = 1;
            let key = null, val = null;
            // operand
            if (b0 === 28) {
                val = _1.Bin.readShort(data, offset + 1);
                vs = 3;
            }
            if (b0 === 29) {
                val = _1.Bin.readInt(data, offset + 1);
                vs = 5;
            }
            if (32 <= b0 && b0 <= 246) {
                val = b0 - 139;
                vs = 1;
            }
            if (247 <= b0 && b0 <= 250) {
                val = (b0 - 247) * 256 + b1 + 108;
                vs = 2;
            }
            if (251 <= b0 && b0 <= 254) {
                val = -(b0 - 251) * 256 - b1 - 108;
                vs = 2;
            }
            if (b0 === 255) {
                val = _1.Bin.readInt(data, offset + 1) / 0xffff;
                vs = 5;
                throw "unknown number";
            }
            if (b0 == 30) {
                let nibs = [];
                vs = 1;
                while (true) {
                    let b = data[offset + vs];
                    vs++;
                    let nib0 = b >> 4, nib1 = b & 0xf;
                    if (nib0 != 0xf)
                        nibs.push(nib0);
                    if (nib1 != 0xf)
                        nibs.push(nib1);
                    if (nib1 == 0xf)
                        break;
                }
                let s = "";
                let chars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ".", "e", "e-", "reserved", "-", "endOfNumber"];
                for (let i = 0; i < nibs.length; i++) {
                    s += chars[nibs[i]];
                }
                val = parseFloat(s);
            }
            // Operator
            if (b0 <= 21) {
                let keys = ["version", "Notice", "FullName", "FamilyName", "Weight", "FontBBox", "BlueValues", "OtherBlues", "FamilyBlues", "FamilyOtherBlues",
                    "StdHW", "StdVW", "escape", "UniqueID", "XUID", "charset", "Encoding", "CharStrings", "Private", "Subrs",
                    "defaultWidthX", "nominalWidthX"];
                key = keys[b0];
                vs = 1;
                if (b0 === 12) {
                    let keys = ["Copyright", "isFixedPitch", "ItalicAngle", "UnderlinePosition", "UnderlineThickness", "PaintType", "CharstringType", "FontMatrix", "StrokeWidth", "BlueScale",
                        "BlueShift", "BlueFuzz", "StemSnapH", "StemSnapV", "ForceBold", 0, 0, "LanguageGroup", "ExpansionFactor", "initialRandomSeed",
                        "SyntheticBase", "PostScript", "BaseFontName", "BaseFontBlend", 0, 0, 0, 0, 0, 0,
                        "ROS", "CIDFontVersion", "CIDFontRevision", "CIDFontType", "CIDCount", "UIDBase", "FDArray", "FDSelect", "FontName"];
                    key = keys[b1];
                    vs = 2;
                }
            }
            if (key !== null) {
                dict[key] = carr.length === 1 ? carr[0] : carr;
                carr = [];
            }
            else {
                carr.push(val);
            }
            offset += vs;
        }
        return dict;
    }
}
CFF.tableSE = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    1, 2, 3, 4, 5, 6, 7, 8,
    9, 10, 11, 12, 13, 14, 15, 16,
    17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32,
    33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48,
    49, 50, 51, 52, 53, 54, 55, 56,
    57, 58, 59, 60, 61, 62, 63, 64,
    65, 66, 67, 68, 69, 70, 71, 72,
    73, 74, 75, 76, 77, 78, 79, 80,
    81, 82, 83, 84, 85, 86, 87, 88,
    89, 90, 91, 92, 93, 94, 95, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 96, 97, 98, 99, 100, 101, 102,
    103, 104, 105, 106, 107, 108, 109, 110,
    0, 111, 112, 113, 114, 0, 115, 116,
    117, 118, 119, 120, 121, 122, 0, 123,
    0, 124, 125, 126, 127, 128, 129, 130,
    131, 0, 132, 133, 0, 134, 135, 136,
    137, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 138, 0, 139, 0, 0, 0, 0,
    140, 141, 142, 143, 0, 0, 0, 0,
    0, 144, 0, 0, 0, 145, 0, 0,
    146, 147, 148, 149, 0, 0, 0, 0
];
exports.CFF = CFF;
//# sourceMappingURL=cff.js.map