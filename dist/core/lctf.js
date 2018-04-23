"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
class Lctf {
    static parse(data, offset, length, font, subt) {
        let obj = {};
        let offset0 = offset;
        offset += 4;
        let offScriptList = _1.Bin.readUshort(data, offset);
        offset += 2;
        let offFeatureList = _1.Bin.readUshort(data, offset);
        offset += 2;
        let offLookupList = _1.Bin.readUshort(data, offset);
        obj.scriptList = Lctf.readScriptList(data, offset0 + offScriptList);
        obj.featureList = Lctf.readFeatureList(data, offset0 + offFeatureList);
        obj.lookupList = Lctf.readLookupList(data, offset0 + offLookupList, subt);
        return obj;
    }
    ;
    static readLookupList(data, offset, subt) {
        let offset0 = offset;
        let obj = [];
        let count = _1.Bin.readUshort(data, offset);
        offset += 2;
        for (let i = 0; i < count; i++) {
            let noff = _1.Bin.readUshort(data, offset);
            offset += 2;
            let lut = Lctf.readLookupTable(data, offset0 + noff, subt);
            obj.push(lut);
        }
        return obj;
    }
    ;
    static readLookupTable(data, offset, subt) {
        let offset0 = offset;
        let obj = { tabs: [] };
        obj.ltype = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.flag = _1.Bin.readUshort(data, offset);
        offset += 2;
        let cnt = _1.Bin.readUshort(data, offset);
        offset += 2;
        for (let i = 0; i < cnt; i++) {
            let noff = _1.Bin.readUshort(data, offset);
            offset += 2;
            let tab = subt(data, obj.ltype, offset0 + noff);
            //console.log(obj.type, tab);
            obj.tabs.push(tab);
        }
        return obj;
    }
    ;
    static numOfOnes(n) {
        let num = 0;
        for (let i = 0; i < 32; i++) {
            if (((n >>> i) & 1) != 0) {
                num++;
            }
        }
        return num;
    }
    ;
    static readClassDef(data, offset) {
        let obj = [];
        let format = _1.Bin.readUshort(data, offset);
        offset += 2;
        if (format === 1) {
            let startGlyph = _1.Bin.readUshort(data, offset);
            offset += 2;
            let glyphCount = _1.Bin.readUshort(data, offset);
            offset += 2;
            for (let i = 0; i < glyphCount; i++) {
                obj.push(startGlyph + i);
                obj.push(startGlyph + i);
                obj.push(_1.Bin.readUshort(data, offset));
                offset += 2;
            }
        }
        if (format == 2) {
            let count = _1.Bin.readUshort(data, offset);
            offset += 2;
            for (let i = 0; i < count; i++) {
                obj.push(_1.Bin.readUshort(data, offset));
                offset += 2;
                obj.push(_1.Bin.readUshort(data, offset));
                offset += 2;
                obj.push(_1.Bin.readUshort(data, offset));
                offset += 2;
            }
        }
        return obj;
    }
    ;
    static getInterval(tab, val) {
        for (let i = 0; i < tab.length; i += 3) {
            let start = tab[i], end = tab[i + 1];
            if (start <= val && val <= end) {
                return i;
            }
        }
        return -1;
    }
    ;
    static readValueRecord(data, offset, valFmt) {
        let arr = [];
        arr.push((valFmt & 1) ? _1.Bin.readShort(data, offset) : 0);
        offset += (valFmt & 1) ? 2 : 0;
        arr.push((valFmt & 2) ? _1.Bin.readShort(data, offset) : 0);
        offset += (valFmt & 2) ? 2 : 0;
        arr.push((valFmt & 4) ? _1.Bin.readShort(data, offset) : 0);
        offset += (valFmt & 4) ? 2 : 0;
        arr.push((valFmt & 8) ? _1.Bin.readShort(data, offset) : 0);
        return arr;
    }
    ;
    static readCoverage(data, offset) {
        let cvg = {};
        cvg.fmt = _1.Bin.readUshort(data, offset);
        offset += 2;
        let count = _1.Bin.readUshort(data, offset);
        offset += 2;
        //console.log("parsing coverage", offset-4, format, count);
        if (cvg.fmt == 1) {
            cvg.tab = _1.Bin.readUshorts(data, offset, count);
        }
        if (cvg.fmt == 2) {
            cvg.tab = _1.Bin.readUshorts(data, offset, count * 3);
        }
        return cvg;
    }
    ;
    static coverageIndex(cvg, val) {
        let tab = cvg.tab;
        if (cvg.fmt === 1) {
            return tab.indexOf(val);
        }
        if (cvg.fmt === 2) {
            let ind = Lctf.getInterval(tab, val);
            if (ind != -1) {
                return tab[ind + 2] + (val - tab[ind]);
            }
        }
        return -1;
    }
    ;
    static readFeatureList(data, offset) {
        let offset0 = offset;
        let obj = [];
        let count = _1.Bin.readUshort(data, offset);
        offset += 2;
        for (let i = 0; i < count; i++) {
            let tag = _1.Bin.readASCII(data, offset, 4);
            offset += 4;
            let noff = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj.push({ tag: tag.trim(), tab: Lctf.readFeatureTable(data, offset0 + noff) });
        }
        return obj;
    }
    ;
    static readFeatureTable(data, offset) {
        let lookupCount = _1.Bin.readUshort(data, offset);
        offset += 2;
        let indices = [];
        for (let i = 0; i < lookupCount; i++) {
            indices.push(_1.Bin.readUshort(data, offset + 2 * i));
        }
        return indices;
    }
    ;
    static readScriptList(data, offset) {
        let offset0 = offset;
        let obj = {};
        let count = _1.Bin.readUshort(data, offset);
        offset += 2;
        for (let i = 0; i < count; i++) {
            let tag = _1.Bin.readASCII(data, offset, 4);
            offset += 4;
            let noff = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj[tag.trim()] = Lctf.readScriptTable(data, offset0 + noff);
        }
        return obj;
    }
    ;
    static readScriptTable(data, offset) {
        let offset0 = offset;
        let obj = {};
        let defLangSysOff = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.default = Lctf.readLangSysTable(data, offset0 + defLangSysOff);
        let langSysCount = _1.Bin.readUshort(data, offset);
        offset += 2;
        for (let i = 0; i < langSysCount; i++) {
            let tag = _1.Bin.readASCII(data, offset, 4);
            offset += 4;
            let langSysOff = _1.Bin.readUshort(data, offset);
            offset += 2;
            obj[tag.trim()] = Lctf.readLangSysTable(data, offset0 + langSysOff);
        }
        return obj;
    }
    ;
    static readLangSysTable(data, offset) {
        let obj = {};
        obj.reqFeature = _1.Bin.readUshort(data, offset);
        offset += 2;
        let featureCount = _1.Bin.readUshort(data, offset);
        offset += 2;
        obj.features = _1.Bin.readUshorts(data, offset, featureCount);
        return obj;
    }
    ;
}
exports.Lctf = Lctf;
//# sourceMappingURL=lctf.js.map