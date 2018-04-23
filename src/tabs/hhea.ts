import { Bin } from "../core/";

export class Hhea {
	public static parse(data, offset, length): any {
		let obj: any = {};
		let tableVersion = Bin.readFixed(data, offset);  offset += 4;
		obj.ascender  = Bin.readShort(data, offset);  offset += 2;
		obj.descender = Bin.readShort(data, offset);  offset += 2;
		obj.lineGap = Bin.readShort(data, offset);  offset += 2;
		
		obj.advanceWidthMax = Bin.readUshort(data, offset);  offset += 2;
		obj.minLeftSideBearing  = Bin.readShort(data, offset);  offset += 2;
		obj.minRightSideBearing = Bin.readShort(data, offset);  offset += 2;
		obj.xMaxExtent = Bin.readShort(data, offset);  offset += 2;
		
		obj.caretSlopeRise = Bin.readShort(data, offset);  offset += 2;
		obj.caretSlopeRun = Bin.readShort(data, offset);  offset += 2;
		obj.caretOffset = Bin.readShort(data, offset);  offset += 2;
		
		offset += 4 * 2;
		
		obj.metricDataFormat = Bin.readShort (data, offset);  offset += 2;
		obj.numberOfHMetrics = Bin.readUshort(data, offset);  offset += 2;
		return obj;
	}
}
