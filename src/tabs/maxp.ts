import { Bin } from "../core/";

export class Maxp {
	public static parse(data, offset, length): any {
		let obj: any = {};
		let ver = Bin.readUint(data, offset); offset += 4;
		obj.numGlyphs = Bin.readUshort(data, offset);  offset += 2;
		
		// only 1.0
		if(ver == 0x00010000) {
			obj.maxPoints             = Bin.readUshort(data, offset);  offset += 2;
			obj.maxContours           = Bin.readUshort(data, offset);  offset += 2;
			obj.maxCompositePoints    = Bin.readUshort(data, offset);  offset += 2;
			obj.maxCompositeContours  = Bin.readUshort(data, offset);  offset += 2;
			obj.maxZones              = Bin.readUshort(data, offset);  offset += 2;
			obj.maxTwilightPoints     = Bin.readUshort(data, offset);  offset += 2;
			obj.maxStorage            = Bin.readUshort(data, offset);  offset += 2;
			obj.maxFunctionDefs       = Bin.readUshort(data, offset);  offset += 2;
			obj.maxInstructionDefs    = Bin.readUshort(data, offset);  offset += 2;
			obj.maxStackElements      = Bin.readUshort(data, offset);  offset += 2;
			obj.maxSizeOfInstructions = Bin.readUshort(data, offset);  offset += 2;
			obj.maxComponentElements  = Bin.readUshort(data, offset);  offset += 2;
			obj.maxComponentDepth     = Bin.readUshort(data, offset);
		}
		
		return obj;
	}
}