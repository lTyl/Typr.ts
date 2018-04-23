"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../core/");
class GSUB {
    static parse(data, offset, length, font) {
        return _1.Lctf.parse(data, offset, length, font, GSUB.subt);
    }
    static subt(data, ltype, offset) {
        var offset0 = offset, tab = {};
        if (ltype !== 1 && ltype !== 4 && ltype !== 5) {
            return null;
        }
        tab.fmt = _1.Bin.readUshort(data, offset);
        offset += 2;
        let covOff = _1.Bin.readUshort(data, offset);
        offset += 2;
        tab.coverage = _1.Lctf.readCoverage(data, covOff + offset0);
        if (false) { }
        //  Single Substitution Subtable
        else if (ltype === 1) {
            if (tab.fmt === 1) {
                tab.delta = _1.Bin.readShort(data, offset);
                offset += 2;
            }
            else if (tab.fmt == 2) {
                let cnt = _1.Bin.readUshort(data, offset);
                offset += 2;
                tab.newg = _1.Bin.readUshorts(data, offset, cnt);
                offset += tab.newg.length * 2;
            }
        }
        //  Ligature Substitution Subtable
        else if (ltype === 4) {
            tab.vals = [];
            let cnt = _1.Bin.readUshort(data, offset);
            offset += 2;
            for (let i = 0; i < cnt; i++) {
                let loff = _1.Bin.readUshort(data, offset);
                offset += 2;
                tab.vals.push(GSUB.readLigatureSet(data, offset0 + loff));
            }
        }
        //  Contextual Substitution Subtable
        else if (ltype === 5) {
            if (tab.fmt === 2) {
                let cDefOffset = _1.Bin.readUshort(data, offset);
                offset += 2;
                tab.cDef = _1.Lctf.readClassDef(data, offset0 + cDefOffset);
                tab.scset = [];
                let subClassSetCount = _1.Bin.readUshort(data, offset);
                offset += 2;
                for (let i = 0; i < subClassSetCount; i++) {
                    let scsOff = _1.Bin.readUshort(data, offset);
                    offset += 2;
                    tab.scset.push(scsOff === 0 ? null : GSUB.readSubClassSet(data, offset0 + scsOff));
                }
            }
            else
                console.log("unknown table format", tab.fmt);
        }
        return tab;
    }
    static readSubClassSet(data, offset) {
        let rUs = _1.Bin.readUshort, offset0 = offset, lset = [];
        let cnt = rUs(data, offset);
        offset += 2;
        for (let i = 0; i < cnt; i++) {
            let loff = rUs(data, offset);
            offset += 2;
            lset.push(GSUB.readSubClassRule(data, offset0 + loff));
        }
        return lset;
    }
    static readSubClassRule(data, offset) {
        let rUs = _1.Bin.readUshort, offset0 = offset, rule = {};
        let gcount = rUs(data, offset);
        offset += 2;
        let scount = rUs(data, offset);
        offset += 2;
        rule.input = [];
        for (let i = 0; i < gcount - 1; i++) {
            rule.input.push(rUs(data, offset));
            offset += 2;
        }
        rule.substLookupRecords = GSUB.readSubstLookupRecords(data, offset, scount);
        return rule;
    }
    static readSubstLookupRecords(data, offset, cnt) {
        let rUs = _1.Bin.readUshort;
        let out = [];
        for (let i = 0; i < cnt; i++) {
            out.push(rUs(data, offset), rUs(data, offset + 2));
            offset += 4;
        }
        return out;
    }
    static readChainSubClassSet(data, offset) {
        let offset0 = offset, lset = [];
        let cnt = _1.Bin.readUshort(data, offset);
        offset += 2;
        for (let i = 0; i < cnt; i++) {
            let loff = _1.Bin.readUshort(data, offset);
            offset += 2;
            lset.push(GSUB.readChainSubClassRule(data, offset0 + loff));
        }
        return lset;
    }
    static readChainSubClassRule(data, offset) {
        let offset0 = offset, rule = {};
        let pps = ["backtrack", "input", "lookahead"];
        for (let pi = 0; pi < pps.length; pi++) {
            let cnt = _1.Bin.readUshort(data, offset);
            offset += 2;
            if (pi === 1) {
                cnt--;
            }
            rule[pps[pi]] = _1.Bin.readUshorts(data, offset, cnt);
            offset += rule[pps[pi]].length * 2;
        }
        let cnt = _1.Bin.readUshort(data, offset);
        offset += 2;
        rule.subst = _1.Bin.readUshorts(data, offset, cnt * 2);
        offset += rule.subst.length * 2;
        return rule;
    }
    static readLigatureSet(data, offset) {
        let offset0 = offset, lset = [];
        let lcnt = _1.Bin.readUshort(data, offset);
        offset += 2;
        for (let j = 0; j < lcnt; j++) {
            let loff = _1.Bin.readUshort(data, offset);
            offset += 2;
            lset.push(GSUB.readLigature(data, offset0 + loff));
        }
        return lset;
    }
    static readLigature(data, offset) {
        let lig = { chain: [] };
        lig.nglyph = _1.Bin.readUshort(data, offset);
        offset += 2;
        let ccnt = _1.Bin.readUshort(data, offset);
        offset += 2;
        for (let k = 0; k < ccnt - 1; k++) {
            lig.chain.push(_1.Bin.readUshort(data, offset));
            offset += 2;
        }
        return lig;
    }
}
exports.GSUB = GSUB;
//# sourceMappingURL=GSUB.js.map