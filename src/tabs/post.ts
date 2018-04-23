import { Bin } from "../core/";

export class Post {
	public static parse(data, offset, length): any {
		let obj: any = {};
		obj.version           = Bin.readFixed(data, offset);  offset += 4;
		obj.italicAngle       = Bin.readFixed(data, offset);  offset += 4;
		obj.underlinePosition = Bin.readShort(data, offset);  offset += 2;
		obj.underlineThickness = Bin.readShort(data, offset);  offset += 2;
		return obj;
	}
}