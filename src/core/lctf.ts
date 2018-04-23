import { Bin } from "./";

export class Lctf {
	public static parse(data, offset, length, font, subt): any {
		let obj: any = {};
		let offset0 = offset;
		offset += 4;
		
		let offScriptList  = Bin.readUshort(data, offset);
		offset += 2;
		let offFeatureList = Bin.readUshort(data, offset);
		offset += 2;
		let offLookupList  = Bin.readUshort(data, offset);
		
		obj.scriptList  = Lctf.readScriptList (data, offset0 + offScriptList);
		obj.featureList = Lctf.readFeatureList(data, offset0 + offFeatureList);
		obj.lookupList  = Lctf.readLookupList (data, offset0 + offLookupList, subt);
		
		return obj;
	};
	public static readLookupList(data, offset, subt): any {
		let offset0 = offset;
		let obj = [];
		let count = Bin.readUshort(data, offset);
		offset+=2;
		
		for(let i = 0; i < count; i++) {
			let noff = Bin.readUshort(data, offset);
			offset += 2;
			let lut = Lctf.readLookupTable(data, offset0 + noff, subt);
			obj.push(lut);
		}
		
		return obj;
	};
	public static readLookupTable(data, offset, subt): any {
		let offset0 = offset;
		let obj: any = {tabs:[]};
		
		obj.ltype = Bin.readUshort(data, offset);
		offset += 2;

		obj.flag = Bin.readUshort(data, offset);
		offset += 2;
		let cnt = Bin.readUshort(data, offset);
		offset += 2;
		
		for(let i = 0; i < cnt; i++) {
			let noff = Bin.readUshort(data, offset);  offset += 2;
			let tab = subt(data, obj.ltype, offset0 + noff);
			//console.log(obj.type, tab);
			obj.tabs.push(tab);
		}
		return obj;
	};
	public static numOfOnes(n: number): any {
		let num = 0;
		for(let i = 0; i < 32; i++){
			if(((n>>>i)&1) != 0) {
				num++;
			}
		}
		return num;
	};
	public static readClassDef(data, offset): any {
		let obj = [];
		let format = Bin.readUshort(data, offset);
		offset += 2;
		if(format === 1) {
			let startGlyph = Bin.readUshort(data, offset);
			offset+=2;
			let glyphCount = Bin.readUshort(data, offset);
			offset+=2;
			for(let i = 0; i < glyphCount; i++) {
				obj.push(startGlyph+i);
				obj.push(startGlyph+i);
				obj.push(Bin.readUshort(data, offset));
				offset+=2;
			}
		}
		if(format==2) {
			let count = Bin.readUshort(data, offset);
			offset+=2;
			for(let i = 0; i < count; i++) {
				obj.push(Bin.readUshort(data, offset));
				offset+=2;
				obj.push(Bin.readUshort(data, offset));
				offset+=2;
				obj.push(Bin.readUshort(data, offset));
				offset+=2;
			}
		}
		return obj;
	};
	public static getInterval(tab, val): any {
		for(let i = 0; i < tab.length; i += 3) {
			let start = tab[i], end = tab[i+1];
			if(start <= val && val <= end) {
				return i;}
		}
		return -1;
	};
	public static readValueRecord(data, offset, valFmt): any {
		let arr = [];
		arr.push((valFmt & 1) ? Bin.readShort(data, offset) : 0 );
		offset += (valFmt&1) ? 2 : 0;
		
		arr.push((valFmt & 2) ? Bin.readShort(data, offset) : 0 );
		offset += (valFmt & 2) ? 2 : 0;
		
		arr.push((valFmt & 4) ? Bin.readShort(data, offset) : 0 );
		offset += (valFmt & 4) ? 2 : 0;
		
		arr.push((valFmt & 8) ? Bin.readShort(data, offset) : 0 );
		return arr;
	};
	public static readCoverage(data, offset): any {
		let cvg: any = {};
		cvg.fmt = Bin.readUshort(data, offset);
		offset += 2;
		let count = Bin.readUshort(data, offset);
		offset+=2;
		//console.log("parsing coverage", offset-4, format, count);
		if(cvg.fmt==1) {
			cvg.tab = Bin.readUshorts(data, offset, count);
		}
		if(cvg.fmt==2) {
			cvg.tab = Bin.readUshorts(data, offset, count * 3);
		}
		return cvg;
	};
	public static coverageIndex(cvg, val): any {
		let tab = cvg.tab;
		if(cvg.fmt === 1){return tab.indexOf(val);}
		if(cvg.fmt === 2) {
			let ind = Lctf.getInterval(tab, val);
			if(ind != -1){return tab[ind+2] + (val - tab[ind]);}
		}
		return -1;
	};
	public static readFeatureList(data, offset): any {
		let offset0 = offset;
		let obj = [];
		
		let count = Bin.readUshort(data, offset);
		offset+=2;
		
		for(let i=0; i<count; i++) {
			let tag = Bin.readASCII(data, offset, 4);
			offset+=4;
			
			let noff = Bin.readUshort(data, offset);
			offset+=2;
			
			obj.push({tag: tag.trim(), tab: Lctf.readFeatureTable(data, offset0 + noff)});
		}
		return obj;
	};
	public static readFeatureTable(data, offset): any {
		let lookupCount = Bin.readUshort(data, offset);  offset += 2;
		
		let indices = [];
		for(let i = 0; i < lookupCount; i++){
			indices.push(Bin.readUshort(data, offset + 2 * i));
		}
		return indices;
	};
	public static readScriptList(data, offset): any {
		let offset0 = offset;
		let obj = {};
		
		let count = Bin.readUshort(data, offset);
		offset+=2;
		
		for(let i = 0; i < count; i++) {
			let tag = Bin.readASCII(data, offset, 4);
			offset+=4;
			
			let noff = Bin.readUshort(data, offset);
			offset+=2;
			
			obj[tag.trim()] = Lctf.readScriptTable(data, offset0 + noff);
		}
		return obj;
	};
	public static readScriptTable(data, offset): any {
		let offset0 = offset;
		let obj: any = {};
		
		let defLangSysOff = Bin.readUshort(data, offset);
		offset+=2;
		
		obj.default = Lctf.readLangSysTable(data, offset0 + defLangSysOff);
		
		let langSysCount = Bin.readUshort(data, offset);
		offset+=2;
		
		for(let i = 0; i < langSysCount; i++) {
			let tag = Bin.readASCII(data, offset, 4);
			offset+=4;
			
			let langSysOff = Bin.readUshort(data, offset);
			offset+=2;
			
			obj[tag.trim()] = Lctf.readLangSysTable(data, offset0 + langSysOff);
		}
		return obj;
	};
	public static readLangSysTable(data, offset): any {
		let obj: any = {};
		
		obj.reqFeature = Bin.readUshort(data, offset);
		offset+=2;

		
		let featureCount = Bin.readUshort(data, offset);
		offset+=2;
		
		obj.features = Bin.readUshorts(data, offset, featureCount);
		return obj;
	};
}