import { Bin } from "./";
import * as Parsers from "../tabs/";

export class Typr {
	public static parse(buff): any {
		let data = new Uint8Array(buff);
		let offset = 0;
		
		let sfnt_version = Bin.readFixed(data, offset);
		offset += 4;
		
		let numTables = Bin.readUshort(data, offset);
		offset += 2;
		
		let searchRange = Bin.readUshort(data, offset);
		offset += 2;
		
		let entrySelector = Bin.readUshort(data, offset);
		offset += 2;
		
		let rangeShift = Bin.readUshort(data, offset);
		offset += 2;

		let tagMap = {
			"cmap": Parsers.Cmap,
			"head": Parsers.Head,
			"hhea": Parsers.Hhea,
			"maxp": Parsers.Maxp,
			"hmtx": Parsers.Hmtx,
			"name": Parsers.Name,
			"OS/2": Parsers.OS2,
			"post": Parsers.Post,
			"loca": Parsers.Loca,
			"glyf": Parsers.Glyf,
			"kern": Parsers.Kern,
			"CFF ": Parsers.CFF,
			"GPOS": Parsers.GPOS,
			"GSUB": Parsers.GSUB,
			"SVG ": Parsers.SVG
		};

		let obj = {_data: data};
		
		let tabs = {};
		
		for(let i = 0; i < numTables; i++) {
			let tag = Bin.readASCII(data, offset, 4);
			offset += 4;
			
			let checkSum = Bin.readUint(data, offset);
			offset += 4;
			
			let toffset = Bin.readUint(data, offset);
			offset += 4;
			
			let length = Bin.readUint(data, offset);
			offset += 4;

			tabs[tag] = {offset:toffset, length:length};
		}

		for (let key in tagMap) {
			let parser = tagMap[key];
			if (tabs[key]){
				obj[key.trim()] = parser.parse(data, tabs[key].offset, tabs[key].length, obj);
			}
		}

		return obj;
	}
	
	public static _tabOffset(data, tab): any {
		let numTables = Bin.readUshort(data, 4);
		let offset = 12;
		for(let i = 0; i < numTables; i++) {
			let tag = Bin.readASCII(data, offset, 4);
			offset += 4;
			
			let checkSum = Bin.readUint(data, offset);
			offset += 4;
			
			let toffset = Bin.readUint(data, offset);
			offset += 4;
			
			let length = Bin.readUint(data, offset);
			offset += 4;
			
			if(tag === tab) {
				return toffset;
			}
		}
		return 0;
	}
}