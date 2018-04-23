import { Bin } from "../core/";

export class Loca {
	public static parse(data, offset, length, font): any {
		let obj = [];
		
		let ver = font.head.indexToLocFormat;
		let len = font.maxp.numGlyphs+1;
		
		if(ver === 0) {
			for(let i = 0; i < len; i++) {
				obj.push(Bin.readUshort(data, offset + (i << 1)) << 1);
			}
		}
		if(ver === 1) {
			for(let i=0; i<len; i++){
				obj.push(Bin.readUint  (data, offset+(i<<2))   );
			}
		}
		
		return obj;
	}
}
