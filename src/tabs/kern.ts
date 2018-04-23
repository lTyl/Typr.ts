import { Bin } from "../core/";

export class Kern {
	public static parse(data, offset, length, font): any {
		let version = Bin.readUshort(data, offset);  offset += 2;
		if(version === 1){return Kern.parseV1(data, offset - 2, length, font);}
		let nTables = Bin.readUshort(data, offset);  offset += 2;
		
		let map = {glyph1: [], rval:[]};
		for(let i = 0; i < nTables; i++) {
			offset += 2;	// skip version
			let length  = Bin.readUshort(data, offset);  offset += 2;
			let coverage = Bin.readUshort(data, offset);  offset += 2;
			let format = coverage>>>8;
			/* I have seen format 128 once, that's why I do */ format &= 0xf;
			if(format==0) {offset = Kern.readFormat0(data, offset, map);}
			else throw "unknown kern table format: " + format;
		}
		return map;
	}
	public static parseV1(data, offset, length, font): any {
		let version = Bin.readFixed(data, offset);  offset += 4;
		let nTables = Bin.readUint(data, offset);  offset += 4;
		
		let map = {glyph1: [], rval:[]};
		for(let i = 0; i < nTables; i++) {
			let length = Bin.readUint(data, offset);   offset += 4;
			let coverage = Bin.readUshort(data, offset);  offset += 2;
			let tupleIndex = Bin.readUshort(data, offset);  offset += 2;
			let format = coverage>>>8;
			/* I have seen format 128 once, that's why I do */ format &= 0xf;
			if(format==0) offset = Kern.readFormat0(data, offset, map);
			else throw "unknown kern table format: "+format;
		}
		return map;
	}
	public static readFormat0(data, offset, map): any {
		let pleft = -1;
		let nPairs        = Bin.readUshort(data, offset);  offset += 2;
		let searchRange   = Bin.readUshort(data, offset);  offset += 2;
		let entrySelector = Bin.readUshort(data, offset);  offset += 2;
		let rangeShift    = Bin.readUshort(data, offset);  offset += 2;
		for(let j = 0; j < nPairs; j++) {
			let left  = Bin.readUshort(data, offset);  offset += 2;
			let right = Bin.readUshort(data, offset);  offset += 2;
			let value = Bin.readShort (data, offset);  offset += 2;
			if(left !== pleft) { map.glyph1.push(left);  map.rval.push({ glyph2:[], vals:[] }) }
			let rval = map.rval[map.rval.length-1];
			rval.glyph2.push(right);
			rval.vals.push(value);
			pleft = left;
		}
		return offset;
	}
}