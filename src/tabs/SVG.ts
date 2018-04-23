import {Bin} from "../core";

export class SVG {
	public static parse(data, offset, length): any {
		let obj = {entries: []};

		let offset0 = offset;

		let tableVersion = Bin.readUshort(data, offset);
		offset += 2;
		let svgDocIndexOffset = Bin.readUint(data, offset);
		offset += 4;
		let reserved = Bin.readUint(data, offset);
		offset += 4;

		offset = svgDocIndexOffset + offset0;

		let numEntries = Bin.readUshort(data, offset);
		offset += 2;

		for (let i = 0; i < numEntries; i++) {
			let startGlyphID = Bin.readUshort(data, offset);
			offset += 2;
			let endGlyphID = Bin.readUshort(data, offset);
			offset += 2;
			let svgDocOffset = Bin.readUint(data, offset);
			offset += 4;
			let svgDocLength = Bin.readUint(data, offset);
			offset += 4;

			let sbuf = new Uint8Array(data.buffer, offset0 + svgDocOffset + svgDocIndexOffset, svgDocLength);
			let svg = Bin.readUTF8(sbuf, 0, sbuf.length);

			for (let f = startGlyphID; f <= endGlyphID; f++) {
				obj.entries[f] = svg;
			}
		}
		return obj;
	}

	public static toPath(str): any {
		let pth = {cmds: [], crds: []};
		if (str == null) return pth;

		let prsr = new DOMParser();
		let doc = prsr["parseFromString"](str, "image/svg+xml");

		let svg: any = doc.firstChild;
		while (svg.tagName != "svg") svg = svg.nextSibling;
		let vb = svg.getAttribute("viewBox");
		if (vb) vb = vb.trim().split(" ").map(parseFloat); else vb = [0, 0, 1000, 1000];
		SVG._toPath(svg.children, pth);
		for (let i = 0; i < pth.crds.length; i += 2) {
			let x = pth.crds[i], y = pth.crds[i + 1];
			x -= vb[0];
			y -= vb[1];
			y = -y;
			pth.crds[i] = x;
			pth.crds[i + 1] = y;
		}
		return pth;
	}

	public static _toPath(nds, pth, fill?): any {
		for (let ni = 0; ni < nds.length; ni++) {
			let nd = nds[ni], tn = nd.tagName;
			let cfl = nd.getAttribute("fill");
			if (cfl == null) cfl = fill;
			if (tn == "g") SVG._toPath(nd.children, pth, cfl);
			else if (tn == "path") {
				pth.cmds.push(cfl ? cfl : "#000000");
				let d = nd.getAttribute("d");  //console.log(d);
				let toks = SVG._tokens(d);  //console.log(toks);
				SVG._toksToPath(toks, pth);
				pth.cmds.push("X");
			}
			else if (tn == "defs") {
			}
			else console.log(tn, nd);
		}
	}

	public static _tokens(d): any {
		let ts = [], off = 0, rn = false, cn = "";  // reading number, current number
		while (off < d.length) {
			let cc = d.charCodeAt(off), ch = d.charAt(off);
			off++;
			let isNum = (48 <= cc && cc <= 57) || ch == "." || ch == "-";

			if (rn) {
				if (ch == "-") {
					ts.push(parseFloat(cn));
					cn = ch;
				}
				else if (isNum) cn += ch;
				else {
					ts.push(parseFloat(cn));
					if (ch != "," && ch != " ") ts.push(ch);
					rn = false;
				}
			}
			else {
				if (isNum) {
					cn = ch;
					rn = true;
				}
				else if (ch != "," && ch != " ") ts.push(ch);
			}
		}
		if (rn) ts.push(parseFloat(cn));
		return ts;
	}

	public static _toksToPath(ts, pth): any {
		let i = 0, x = 0, y = 0, ox = 0, oy = 0;
		let pc = {"M": 2, "L": 2, "H": 1, "V": 1, "S": 4, "C": 6};
		let cmds = pth.cmds, crds = pth.crds;

		while (i < ts.length) {
			let cmd = ts[i];
			i++;

			if (cmd == "z") {
				cmds.push("Z");
				x = ox;
				y = oy;
			}
			else {
				let cmu = cmd.toUpperCase();
				let ps = pc[cmu], reps = SVG._reps(ts, i, ps);

				for (let j = 0; j < reps; j++) {
					let xi = 0, yi = 0;
					if (cmd != cmu) {
						xi = x;
						yi = y;
					}

					if (false) {
					}
					else if (cmu == "M") {
						x = xi + ts[i++];
						y = yi + ts[i++];
						cmds.push("M");
						crds.push(x, y);
						ox = x;
						oy = y;
					}
					else if (cmu == "L") {
						x = xi + ts[i++];
						y = yi + ts[i++];
						cmds.push("L");
						crds.push(x, y);
					}
					else if (cmu == "H") {
						x = xi + ts[i++];
						cmds.push("L");
						crds.push(x, y);
					}
					else if (cmu == "V") {
						y = yi + ts[i++];
						cmds.push("L");
						crds.push(x, y);
					}
					else if (cmu == "C") {
						let x1 = xi + ts[i++], y1 = yi + ts[i++], x2 = xi + ts[i++], y2 = yi + ts[i++],
							x3 = xi + ts[i++], y3 = yi + ts[i++];
						cmds.push("C");
						crds.push(x1, y1, x2, y2, x3, y3);
						x = x3;
						y = y3;
					}
					else if (cmu == "S") {
						let co = Math.max(crds.length - 4, 0);
						let x1 = x + x - crds[co], y1 = y + y - crds[co + 1];
						let x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
						cmds.push("C");
						crds.push(x1, y1, x2, y2, x3, y3);
						x = x3;
						y = y3;
					}
					else console.log("Unknown SVG command " + cmd);
				}
			}
		}
	}

	public static _reps(ts, off, ps): any {
		let i = off;
		while (i < ts.length) {
			if ((typeof ts[i]) == "string") break;
			i += ps;
		}
		return (i - off) / ps;
	}
}