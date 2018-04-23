import { Bin } from "../core/";

export class OS2 {
	public static parse(data, offset, length): any {
		let ver = Bin.readUshort(data, offset); offset += 2;
		let obj = {};
		if (ver === 0) {OS2.version0(data, offset, obj);}
		else if(ver === 1) {OS2.version1(data, offset, obj);}
		else if(ver === 2 || ver === 3 || ver ===4) {OS2.version2(data, offset, obj);}
		else if(ver === 5) {OS2.version5(data, offset, obj);}
		else throw "unknown OS/2 table version: " + ver;
		
		return obj;
	}
	public static version0(data, offset, obj): any {
		obj.xAvgCharWidth = Bin.readShort(data, offset); offset += 2;
		obj.usWeightClass = Bin.readUshort(data, offset); offset += 2;
		obj.usWidthClass  = Bin.readUshort(data, offset); offset += 2;
		obj.fsType = Bin.readUshort(data, offset); offset += 2;
		obj.ySubscriptXSize = Bin.readShort(data, offset); offset += 2;
		obj.ySubscriptYSize = Bin.readShort(data, offset); offset += 2;
		obj.ySubscriptXOffset = Bin.readShort(data, offset); offset += 2;
		obj.ySubscriptYOffset = Bin.readShort(data, offset); offset += 2;
		obj.ySuperscriptXSize = Bin.readShort(data, offset); offset += 2;
		obj.ySuperscriptYSize = Bin.readShort(data, offset); offset += 2;
		obj.ySuperscriptXOffset = Bin.readShort(data, offset); offset += 2;
		obj.ySuperscriptYOffset = Bin.readShort(data, offset); offset += 2;
		obj.yStrikeoutSize = Bin.readShort(data, offset); offset += 2;
		obj.yStrikeoutPosition = Bin.readShort(data, offset); offset += 2;
		obj.sFamilyClass = Bin.readShort(data, offset); offset += 2;
		obj.panose = Bin.readBytes(data, offset, 10);  offset += 10;
		obj.ulUnicodeRange1	= Bin.readUint(data, offset);  offset += 4;
		obj.ulUnicodeRange2	= Bin.readUint(data, offset);  offset += 4;
		obj.ulUnicodeRange3	= Bin.readUint(data, offset);  offset += 4;
		obj.ulUnicodeRange4	= Bin.readUint(data, offset);  offset += 4;
		obj.achVendID = [Bin.readInt8(data, offset), Bin.readInt8(data, offset + 1), Bin.readInt8(data, offset + 2), Bin.readInt8(data, offset+3)];  offset += 4;
		obj.fsSelection	 = Bin.readUshort(data, offset); offset += 2;
		obj.usFirstCharIndex = Bin.readUshort(data, offset); offset += 2;
		obj.usLastCharIndex = Bin.readUshort(data, offset); offset += 2;
		obj.sTypoAscender = Bin.readShort(data, offset); offset += 2;
		obj.sTypoDescender = Bin.readShort(data, offset); offset += 2;
		obj.sTypoLineGap = Bin.readShort(data, offset); offset += 2;
		obj.usWinAscent = Bin.readUshort(data, offset); offset += 2;
		obj.usWinDescent = Bin.readUshort(data, offset); offset += 2;
		return offset;
	}
	
	public static version1(data, offset, obj): any {
		offset = OS2.version0(data, offset, obj);
		
		obj.ulCodePageRange1 = Bin.readUint(data, offset); offset += 4;
		obj.ulCodePageRange2 = Bin.readUint(data, offset); offset += 4;
		return offset;
	}
	
	public static version2(data, offset, obj): any {
		offset = OS2.version1(data, offset, obj);
		
		obj.sxHeight = Bin.readShort(data, offset); offset += 2;
		obj.sCapHeight = Bin.readShort(data, offset); offset += 2;
		obj.usDefault = Bin.readUshort(data, offset); offset += 2;
		obj.usBreak = Bin.readUshort(data, offset); offset += 2;
		obj.usMaxContext = Bin.readUshort(data, offset); offset += 2;
		return offset;
	}
	
	public static version5(data, offset, obj): any {
		offset = OS2.version2(data, offset, obj);
		obj.usLowerOpticalPointSize = Bin.readUshort(data, offset); offset += 2;
		obj.usUpperOpticalPointSize = Bin.readUshort(data, offset); offset += 2;
		return offset;
	}
}