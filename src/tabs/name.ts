import {Bin} from "../core/";

export class Name {
	public static parse(data, offset, length): any {
		let bin = Bin;
		let obj = {};
		let format = bin.readUshort(data, offset);
		offset += 2;
		let count = bin.readUshort(data, offset);
		offset += 2;
		let stringOffset = bin.readUshort(data, offset);
		offset += 2;


		//console.log(format, count);

		let offset0 = offset;

		for (let i = 0; i < count; i++) {
			let platformID = bin.readUshort(data, offset);
			offset += 2;
			let encodingID = bin.readUshort(data, offset);
			offset += 2;
			let languageID = bin.readUshort(data, offset);
			offset += 2;
			let nameID = bin.readUshort(data, offset);
			offset += 2;
			let length = bin.readUshort(data, offset);
			offset += 2;
			let noffset = bin.readUshort(data, offset);
			offset += 2;
			//console.log(platformID, encodingID, languageID.toString(16), nameID, length, noffset);

			let plat = "p" + platformID;//Typr._platforms[platformID];
			if (obj[plat] == null) obj[plat] = {};

			let names = [
				"copyright",
				"fontFamily",
				"fontSubfamily",
				"ID",
				"fullName",
				"version",
				"postScriptName",
				"trademark",
				"manufacturer",
				"designer",
				"description",
				"urlVendor",
				"urlDesigner",
				"licence",
				"licenceURL",
				"---",
				"typoFamilyName",
				"typoSubfamilyName",
				"compatibleFull",
				"sampleText",
				"postScriptCID",
				"wwsFamilyName",
				"wwsSubfamilyName",
				"lightPalette",
				"darkPalette"
			];
			let cname = names[nameID];
			let soff = offset0 + count * 12 + noffset;
			let str;
			if (false) {
			}
			else if (platformID == 0) str = bin.readUnicode(data, soff, length / 2);
			else if (platformID == 3 && encodingID == 0) str = bin.readUnicode(data, soff, length / 2);
			else if (encodingID == 0) str = bin.readASCII(data, soff, length);
			else if (encodingID == 1) str = bin.readUnicode(data, soff, length / 2);
			else if (encodingID == 3) str = bin.readUnicode(data, soff, length / 2);

			else if (platformID == 1) {
				str = bin.readASCII(data, soff, length);
				console.log("reading unknown MAC encoding " + encodingID + " as ASCII")
			}
			else throw "unknown encoding " + encodingID + ", platformID: " + platformID;

			obj[plat][cname] = str;
			obj[plat]._lang = languageID;
		}
		/*
		if(format == 1)
		{
			var langTagCount = bin.readUshort(data, offset);  offset += 2;
			for(var i=0; i<langTagCount; i++)
			{
				var length  = bin.readUshort(data, offset);  offset += 2;
				var noffset = bin.readUshort(data, offset);  offset += 2;
			}
		}
		*/

		//console.log(obj);

		for (let p in obj) if (obj[p].postScriptName != null && obj[p]._lang == 0x0409) return obj[p];		// United States
		for (let p in obj) if (obj[p].postScriptName != null && obj[p]._lang == 0x0c0c) return obj[p];		// Canada
		for (let p in obj) if (obj[p].postScriptName != null) return obj[p];

		let tname;
		for (let p in obj) {
			tname = p;
			break;
		}
		console.log("returning name table with languageID " + obj[tname]._lang);
		return obj[tname];
	}
}