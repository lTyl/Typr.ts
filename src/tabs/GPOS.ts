import { Bin, Lctf } from "../core/";

export class GPOS {
	public static parse(data, offset, length, font): any {
		return Lctf.parse(data, offset, length, font, GPOS.subt);
	}
	public static subt(data, ltype, offset): any {
		if(ltype !== 2){return null;}
		
		let offset0 = offset, tab: any = {};
		
		tab.format  = Bin.readUshort(data, offset);  offset += 2;
		let covOff  = Bin.readUshort(data, offset);  offset += 2;
		tab.coverage = Lctf.readCoverage(data, covOff + offset0);
		tab.valFmt1 = Bin.readUshort(data, offset);  offset += 2;
		tab.valFmt2 = Bin.readUshort(data, offset);  offset += 2;
		let ones1 = Lctf.numOfOnes(tab.valFmt1);
		let ones2 = Lctf.numOfOnes(tab.valFmt2);
		if(tab.format === 1) {
			tab.pairsets = [];
			let count = Bin.readUshort(data, offset);  offset += 2;
			
			for(let i = 0; i < count; i++) {
				let psoff = Bin.readUshort(data, offset);  offset += 2;
				psoff += offset0;
				let pvcount = Bin.readUshort(data, psoff);  psoff += 2;
				let arr = [];
				for(let j = 0; j < pvcount; j++) {
					let gid2 = Bin.readUshort(data, psoff);  psoff += 2;
					let value1, value2;
					if(tab.valFmt1 !== 0) {value1 = Lctf.readValueRecord(data, psoff, tab.valFmt1);  psoff += ones1 * 2;}
					if(tab.valFmt2 !== 0) {value2 = Lctf.readValueRecord(data, psoff, tab.valFmt2);  psoff += ones2 * 2;}
					arr.push({gid2:gid2, val1:value1, val2:value2});
				}
				tab.pairsets.push(arr);
			}
		}
		if(tab.format === 2) {
			let classDef1 = Bin.readUshort(data, offset);  offset += 2;
			let classDef2 = Bin.readUshort(data, offset);  offset += 2;
			let class1Count = Bin.readUshort(data, offset);  offset += 2;
			let class2Count = Bin.readUshort(data, offset);  offset += 2;
			
			tab.classDef1 = Lctf.readClassDef(data, offset0 + classDef1);
			tab.classDef2 = Lctf.readClassDef(data, offset0 + classDef2);
			
			tab.matrix = [];
			for(let i = 0; i < class1Count; i++) {
				let row = [];
				for(let j = 0; j < class2Count; j++) {
					let value1 = null, value2 = null;
					if(tab.valFmt1 !== 0) { value1 = Lctf.readValueRecord(data, offset, tab.valFmt1);  offset += ones1 * 2; }
					if(tab.valFmt2 !== 0) { value2 = Lctf.readValueRecord(data, offset, tab.valFmt2);  offset += ones2 * 2; }
					row.push({val1: value1, val2: value2});
				}
				tab.matrix.push(row);
			}
		}
		return tab;
	}
}