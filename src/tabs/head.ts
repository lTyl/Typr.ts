import { Bin } from "../core/";

export class Head {
	public static parse(data, offset, length): any {
		let obj: any = {};
		let tableVersion = Bin.readFixed(data, offset);  offset += 4;
		obj.fontRevision = Bin.readFixed(data, offset);  offset += 4;
		let checkSumAdjustment = Bin.readUint(data, offset);  offset += 4;
		let magicNumber = Bin.readUint(data, offset);  offset += 4;
		obj.flags = Bin.readUshort(data, offset);  offset += 2;
		obj.unitsPerEm = Bin.readUshort(data, offset);  offset += 2;
		obj.created = Bin.readUint64(data, offset);  offset += 8;
		obj.modified = Bin.readUint64(data, offset);  offset += 8;
		obj.xMin = Bin.readShort(data, offset);  offset += 2;
		obj.yMin = Bin.readShort(data, offset);  offset += 2;
		obj.xMax = Bin.readShort(data, offset);  offset += 2;
		obj.yMax = Bin.readShort(data, offset);  offset += 2;
		obj.macStyle = Bin.readUshort(data, offset);  offset += 2;
		obj.lowestRecPPEM = Bin.readUshort(data, offset);  offset += 2;
		obj.fontDirectionHint = Bin.readShort(data, offset);  offset += 2;
		obj.indexToLocFormat = Bin.readShort(data, offset);  offset += 2;
		obj.glyphDataFormat = Bin.readShort(data, offset);  offset += 2;
		return obj;
	}
}