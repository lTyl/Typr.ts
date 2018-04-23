import { Bin } from "../core/";

export class Cmap {
	public static parse(data, offset, length): any {
		data = new Uint8Array(data.buffer, offset, length);
		offset = 0;
		
		let offset0 = offset;
		let obj: any = {};
		let version = Bin.readUshort(data, offset);
		offset += 2;
		
		let numTables = Bin.readUshort(data, offset);
		offset += 2;
		
		let offs = [];
		obj.tables = [];
		
		
		for(let i = 0; i < numTables; i++) {
			let platformID = Bin.readUshort(data, offset);
			offset += 2;
			
			let encodingID = Bin.readUshort(data, offset);
			offset += 2;
			
			let noffset = Bin.readUint(data, offset);
			offset += 4;
			
			let id = "p" + platformID + "e" + encodingID;
			
			var tind = offs.indexOf(noffset);
			
			if(tind === -1) {
				tind = obj.tables.length;
				let subt;
				offs.push(noffset);
				let format = Bin.readUshort(data, noffset);
				if     (format === 0) {subt = Cmap.parse0(data, noffset);}
				else if(format === 4) {subt = Cmap.parse4(data, noffset);}
				else if(format === 6) {subt = Cmap.parse6(data, noffset);}
				else if(format ===12) {subt = Cmap.parse12(data,noffset);}
				else {console.log("unknown format: " + format, platformID, encodingID, noffset);}
				obj.tables.push(subt);
			}
			
			if(obj[id] != null) {throw "multiple tables for one platform + encoding";}
			obj[id] = tind;
		}
		return obj;
	}
	public static parse0(data, offset): any {
		let obj: any = {};
		obj.format = Bin.readUshort(data, offset);
		offset += 2;
		
		let len = Bin.readUshort(data, offset);
		offset += 2;
		
		let lang = Bin.readUshort(data, offset);
		offset += 2;
		
		obj.map = [];
		for(let i = 0; i < len - 6; i++) {obj.map.push(data[offset + i]);}
		return obj;
	}
	public static parse4(data, offset): any {
		let offset0 = offset;
		let obj: any = {};
		
		obj.format = Bin.readUshort(data, offset);  offset += 2;
		let length = Bin.readUshort(data, offset);  offset += 2;
		let language = Bin.readUshort(data, offset);  offset += 2;
		let segCountX2 = Bin.readUshort(data, offset);  offset += 2;
		let segCount = segCountX2/2;
		obj.searchRange = Bin.readUshort(data, offset);  offset += 2;
		obj.entrySelector = Bin.readUshort(data, offset);  offset += 2;
		obj.rangeShift = Bin.readUshort(data, offset);  offset += 2;
		obj.endCount   = Bin.readUshorts(data, offset, segCount);  offset += segCount*2;
		offset+=2;
		obj.startCount = Bin.readUshorts(data, offset, segCount);  offset += segCount*2;
		obj.idDelta = [];
		for(let i = 0; i < segCount; i++) {obj.idDelta.push(Bin.readShort(data, offset));  offset += 2;}
		obj.idRangeOffset = Bin.readUshorts(data, offset, segCount);  offset += segCount*2;
		obj.glyphIdArray = [];
		while(offset < offset0 + length) {obj.glyphIdArray.push(Bin.readUshort(data, offset));  offset += 2;}
		return obj;
	}
	public static parse6(data, offset): any {
		let offset0 = offset;
		let obj: any = {};
		
		obj.format = Bin.readUshort(data, offset);  offset += 2;
		let length = Bin.readUshort(data, offset);  offset += 2;
		let language = Bin.readUshort(data, offset);  offset += 2;
		obj.firstCode = Bin.readUshort(data, offset);  offset += 2;
		let entryCount = Bin.readUshort(data, offset);  offset += 2;
		obj.glyphIdArray = [];
		for(let i = 0; i < entryCount; i++) {obj.glyphIdArray.push(Bin.readUshort(data, offset));  offset += 2;}
		
		return obj;
	}
	public static parse12(data, offset): any {
		let offset0 = offset;
		let obj: any = {};
		
		obj.format = Bin.readUshort(data, offset);  offset += 2;
		offset += 2;
		let length = Bin.readUint(data, offset);  offset += 4;
		let lang   = Bin.readUint(data, offset);  offset += 4;
		let nGroups= Bin.readUint(data, offset);  offset += 4;
		obj.groups = [];
		
		for(let i = 0; i < nGroups; i++) {
			let off = offset + i * 12;
			let startCharCode = Bin.readUint(data, off + 0);
			let endCharCode   = Bin.readUint(data, off + 4);
			let startGlyphID  = Bin.readUint(data, off + 8);
			obj.groups.push([  startCharCode, endCharCode, startGlyphID  ]);
		}
		return obj;
	}
}