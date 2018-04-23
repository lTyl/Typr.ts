import * as Core from "./";
import * as Parsers from "../tabs/";

class P {
	public static moveTo(p, x, y) {
		p.cmds.push("M");
		p.crds.push(x, y);
	}

	public static lineTo(p, x, y) {
		p.cmds.push("L");
		p.crds.push(x, y);
	}

	public static curveTo(p, a, b, c, d, e, f) {
		p.cmds.push("C");
		p.crds.push(a, b, c, d, e, f);
	}

	public static qcurveTo(p, a, b, c, d) {
		p.cmds.push("Q");
		p.crds.push(a, b, c, d);
	}

	public static closePath(p) {
		p.cmds.push("Z");
	}
}


export class TyprU {
	public static codeToGlyph(font, code) {
		let cmap = font.cmap;

		let tind = -1;
		if (cmap.p0e4 != null) tind = cmap.p0e4;
		else if (cmap.p3e1 != null) tind = cmap.p3e1;
		else if (cmap.p1e0 != null) tind = cmap.p1e0;

		if (tind == -1) throw "no familiar platform and encoding!";

		let tab = cmap.tables[tind];

		if (tab.format == 0) {
			if (code >= tab.map.length) return 0;
			return tab.map[code];
		}
		else if (tab.format == 4) {
			var sind = -1;
			for (let i = 0; i < tab.endCount.length; i++) if (code <= tab.endCount[i]) {
				sind = i;
				break;
			}
			if (sind == -1) return 0;
			if (tab.startCount[sind] > code) return 0;

			let gli = 0;
			if (tab.idRangeOffset[sind] != 0) gli = tab.glyphIdArray[(code - tab.startCount[sind]) + (tab.idRangeOffset[sind] >> 1) - (tab.idRangeOffset.length - sind)];
			else gli = code + tab.idDelta[sind];
			return gli & 0xFFFF;
		}
		else if (tab.format == 12) {
			if (code > tab.groups[tab.groups.length - 1][1]) return 0;
			for (let i = 0; i < tab.groups.length; i++) {
				let grp = tab.groups[i];
				if (grp[0] <= code && code <= grp[1]) return grp[2] + (code - grp[0]);
			}
			return 0;
		}
		else throw "unknown cmap table format " + tab.format;
	}

	public static glyphToPath(font, gid): any {
		let path = {cmds: [], crds: []};
		if (font.SVG && font.SVG.entries[gid]) {
			let p = font.SVG.entries[gid];
			if (p == null) return path;
			if (typeof p == "string") {
				p = Parsers.SVG.toPath(p);
				font.SVG.entries[gid] = p;
			}
			return p;
		}
		else if (font.CFF) {
			let state = {
				x: 0,
				y: 0,
				stack: [],
				nStems: 0,
				haveWidth: false,
				width: font.CFF.Private ? font.CFF.Private.defaultWidthX : 0,
				open: false
			};
			TyprU._drawCFF(font.CFF.CharStrings[gid], state, font.CFF, path);
		}
		else if (font.glyf) {
			TyprU._drawGlyf(gid, font, path);
		}
		return path;
	}

	public static _drawGlyf(gid, font, path): any {
		let gl = font.glyf[gid];
		if (gl == null) gl = font.glyf[gid] = Parsers.Glyf._parseGlyf(font, gid);
		if (gl != null) {
			if (gl.noc > -1) TyprU._simpleGlyph(gl, path);
			else TyprU._compoGlyph(gl, font, path);
		}
	}

	public static _compoGlyph(gl, font, p){
		for(let j=0; j<gl.parts.length; j++)
		{
			let path = { cmds:[], crds:[] };
			let prt = gl.parts[j];
			TyprU._drawGlyf(prt.glyphIndex, font, path);

			let m = prt.m;
			for(let i=0; i<path.crds.length; i+=2)
			{
				let x = path.crds[i  ], y = path.crds[i+1];
				p.crds.push(x*m.a + y*m.b + m.tx);
				p.crds.push(x*m.c + y*m.d + m.ty);
			}
			for(let i=0; i<path.cmds.length; i++) p.cmds.push(path.cmds[i]);
		}
	}

	public static _simpleGlyph(gl, p): any {
		for (let c = 0; c < gl.noc; c++) {
			let i0 = (c == 0) ? 0 : (gl.endPts[c - 1] + 1);
			let il = gl.endPts[c];

			for (let i = i0; i <= il; i++) {
				let pr = (i == i0) ? il : (i - 1);
				let nx = (i == il) ? i0 : (i + 1);
				let onCurve = gl.flags[i] & 1;
				let prOnCurve = gl.flags[pr] & 1;
				let nxOnCurve = gl.flags[nx] & 1;

				let x = gl.xs[i], y = gl.ys[i];

				if (i == i0) {
					if (onCurve) {
						if (prOnCurve) P.moveTo(p, gl.xs[pr], gl.ys[pr]);
						else {
							P.moveTo(p, x, y);
							continue;
							/*  will do curveTo at il  */
						}
					}
					else {
						if (prOnCurve) P.moveTo(p, gl.xs[pr], gl.ys[pr]);
						else P.moveTo(p, (gl.xs[pr] + x) / 2, (gl.ys[pr] + y) / 2);
					}
				}
				if (onCurve) {
					if (prOnCurve) P.lineTo(p, x, y);
				}
				else {
					if (nxOnCurve) P.qcurveTo(p, x, y, gl.xs[nx], gl.ys[nx]);
					else P.qcurveTo(p, x, y, (x + gl.xs[nx]) / 2, (y + gl.ys[nx]) / 2);
				}
			}
			P.closePath(p);
		}
	}

	public static _compGlyph(gl, font, p): any {
		for (let j = 0; j < gl.parts.length; j++) {
			let path = {cmds: [], crds: []};
			let prt = gl.parts[j];
			TyprU._drawGlyf(prt.glyphIndex, font, path);

			let m = prt.m;
			for (let i = 0; i < path.crds.length; i += 2) {
				let x = path.crds[i], y = path.crds[i + 1];
				p.crds.push(x * m.a + y * m.b + m.tx);
				p.crds.push(x * m.c + y * m.d + m.ty);
			}
			for (let i = 0; i < path.cmds.length; i++) p.cmds.push(path.cmds[i]);
		}
	}

	public static _getGlyphClass(g, cd): any {
		let intr = Core.Lctf.getInterval(cd, g);
		return intr == -1 ? 0 : cd[intr + 2];
	}

	public static getPairAdjustment(font, g1, g2): any {
		if (font.GPOS) {
			let ltab = null;
			for (let i = 0; i < font.GPOS.featureList.length; i++) {
				let fl = font.GPOS.featureList[i];
				if (fl.tag == "kern")
					for (let j = 0; j < fl.tab.length; j++)
						if (font.GPOS.lookupList[fl.tab[j]].ltype == 2) ltab = font.GPOS.lookupList[fl.tab[j]];
			}
			if (ltab) {
				let adjv = 0;
				for (let i = 0; i < ltab.tabs.length; i++) {
					let tab = ltab.tabs[i];
					let ind = Core.Lctf.coverageIndex(tab.coverage, g1);
					if (ind == -1) continue;
					let adj;
					if (tab.format == 1) {
						let right = tab.pairsets[ind];
						for (let j = 0; j < right.length; j++) if (right[j].gid2 == g2) adj = right[j];
						if (adj == null) continue;
					}
					else if (tab.format == 2) {
						let c1 = TyprU._getGlyphClass(g1, tab.classDef1);
						let c2 = TyprU._getGlyphClass(g2, tab.classDef2);
						let adj = tab.matrix[c1][c2];
					}
					return adj.val1[2];
				}
			}
		}
		if (font.kern) {
			let ind1 = font.kern.glyph1.indexOf(g1);
			if (ind1 != -1) {
				let ind2 = font.kern.rval[ind1].glyph2.indexOf(g2);
				if (ind2 != -1) return font.kern.rval[ind1].vals[ind2];
			}
		}

		return 0;
	}

	public static stringToGlyphs(font, str): any {
		let gls = [];
		for (let i = 0; i < str.length; i++) {
			let cc = str.codePointAt(i);
			if (cc > 0xffff) i++;
			gls.push(TyprU.codeToGlyph(font, cc));
		}

		let gsub = font["GSUB"];
		if (gsub == null) return gls;
		let llist = gsub.lookupList, flist = gsub.featureList;

		let wsep = "\n\t\" ,.:;!?()  ،";
		let R = "آأؤإاةدذرزوٱٲٳٵٶٷڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙۀۃۄۅۆۇۈۉۊۋۍۏےۓەۮۯܐܕܖܗܘܙܞܨܪܬܯݍݙݚݛݫݬݱݳݴݸݹࡀࡆࡇࡉࡔࡧࡩࡪࢪࢫࢬࢮࢱࢲࢹૅેૉ૊૎૏ૐ૑૒૝ૡ૤૯஁ஃ஄அஉ஌எஏ஑னப஫஬";
		let L = "ꡲ્૗";

		for (let ci = 0; ci < gls.length; ci++) {
			let gl = gls[ci];

			let slft = ci == 0 || wsep.indexOf(str[ci - 1]) != -1;
			let srgt = ci == gls.length - 1 || wsep.indexOf(str[ci + 1]) != -1;

			if (!slft && R.indexOf(str[ci - 1]) != -1) slft = true;
			if (!srgt && R.indexOf(str[ci]) != -1) srgt = true;

			if (!srgt && L.indexOf(str[ci + 1]) != -1) srgt = true;
			if (!slft && L.indexOf(str[ci]) != -1) slft = true;

			let feat = null;
			if (slft) feat = srgt ? "isol" : "init";
			else feat = srgt ? "fina" : "medi";

			for (let fi = 0; fi < flist.length; fi++) {
				if (flist[fi].tag != feat) continue;
				for (let ti = 0; ti < flist[fi].tab.length; ti++) {
					let tab = llist[flist[fi].tab[ti]];
					if (tab.ltype != 1) continue;
					TyprU._applyType1(gls, ci, tab);
				}
			}
		}
		let cligs = ["rlig", "liga", "mset"];

		//console.log(gls);

		for (let ci = 0; ci < gls.length; ci++) {
			let gl = gls[ci];
			let rlim = Math.min(3, gls.length - ci - 1);
			for (let fi = 0; fi < flist.length; fi++) {
				let fl = flist[fi];
				if (cligs.indexOf(fl.tag) == -1) continue;
				for (let ti = 0; ti < fl.tab.length; ti++) {
					let tab = llist[fl.tab[ti]];
					for (let j = 0; j < tab.tabs.length; j++) {
						if (tab.tabs[j] == null) continue;
						let ind = Core.Lctf.coverageIndex(tab.tabs[j].coverage, gl);
						if (ind == -1) continue;
						//*
						if (tab.ltype == 4) {
							let vals = tab.tabs[j].vals[ind];

							for (let k = 0; k < vals.length; k++) {
								let lig = vals[k], rl = lig.chain.length;
								if (rl > rlim) continue;
								let good = true;
								for (let l = 0; l < rl; l++) if (lig.chain[l] != gls[ci + (1 + l)]) good = false;
								if (!good) continue;
								gls[ci] = lig.nglyph;
								for (let l = 0; l < rl; l++) gls[ci + l + 1] = -1;
								//console.log("lig", fl.tag,  gl, lig.chain, lig.nglyph);
							}
						}
						else if (tab.ltype == 5) {
							let ltab = tab.tabs[j];
							if (ltab.fmt != 2) continue;
							let cind = Core.Lctf.getInterval(ltab.cDef, gl);
							let cls = ltab.cDef[cind + 2], scs = ltab.scset[cls];
							for (let i = 0; i < scs.length; i++) {
								let sc = scs[i], inp = sc.input;
								if (inp.length > rlim) continue;
								let good = true;
								for (let l = 0; l < inp.length; l++) {
									let cind2 = Core.Lctf.getInterval(ltab.cDef, gls[ci + 1 + l]);
									if (cind == -1 && ltab.cDef[cind2 + 2] != inp[l]) {
										good = false;
										break;
									}
								}
								if (!good) continue;
								//console.log(ci, gl);
								let lrs = sc.substLookupRecords;
								for (let k = 0; k < lrs.length; k += 2) {
									let gi = lrs[k], tabi = lrs[k + 1];
									//Typr.U._applyType1(gls, ci+gi, llist[tabi]);
									//console.log(tabi, gls[ci+gi], llist[tabi]);
								}
							}
						}
					}
				}
			}
		}
		return gls;
	}

	public static _applyType1(gls, ci, tab): any {
		let gl = gls[ci];
		for (let j = 0; j < tab.tabs.length; j++) {
			let ttab = tab.tabs[j];
			let ind = Core.Lctf.coverageIndex(ttab.coverage, gl);
			if (ind == -1) continue;
			if (ttab.fmt == 1) gls[ci] = gls[ci] + ttab.delta;
			else gls[ci] = ttab.newg[ind];
			//console.log(ci, gl, "subst", flist[fi].tag, i, j, ttab.newg[ind]);
		}
	}

	public static glyphsToPath(font, gls, clr): any {
		//gls = gls.reverse();//gls.slice(0,12).concat(gls.slice(12).reverse());

		let tpath = {cmds: [], crds: []};
		let x = 0;

		for (let i = 0; i < gls.length; i++) {
			let gid = gls[i];
			if (gid == -1) continue;
			let gid2 = (i < gls.length - 1 && gls[i + 1] != -1) ? gls[i + 1] : 0;
			let path = TyprU.glyphToPath(font, gid);
			for (let j = 0; j < path.crds.length; j += 2) {
				tpath.crds.push(path.crds[j] + x);
				tpath.crds.push(path.crds[j + 1]);
			}
			if (clr) tpath.cmds.push(clr);
			for (let j = 0; j < path.cmds.length; j++) tpath.cmds.push(path.cmds[j]);
			if (clr) tpath.cmds.push("X");
			x += font.hmtx.aWidth[gid];// - font.hmtx.lsBearing[gid];
			if (i < gls.length - 1) x += TyprU.getPairAdjustment(font, gid, gid2);
		}
		return tpath;
	}

	public static pathToSVG(path, prec): any {
		if (prec == null) prec = 5;
		let out = [], co = 0, lmap = {"M": 2, "L": 2, "Q": 4, "C": 6};
		for (let i = 0; i < path.cmds.length; i++) {
			let cmd = path.cmds[i], cn = co + (lmap[cmd] ? lmap[cmd] : 0);
			out.push(cmd);
			while (co < cn) {
				let c = path.crds[co++];
				out.push(parseFloat(c.toFixed(prec)) + (co == cn ? "" : " "));
			}
		}
		return out.join("");
	}

	public static pathToContext(path, ctx): any {
		let c = 0, crds = path.crds;

		for (let j = 0; j < path.cmds.length; j++) {
			let cmd = path.cmds[j];
			if (cmd == "M") {
				ctx.moveTo(crds[c], crds[c + 1]);
				c += 2;
			}
			else if (cmd == "L") {
				ctx.lineTo(crds[c], crds[c + 1]);
				c += 2;
			}
			else if (cmd == "C") {
				ctx.bezierCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3], crds[c + 4], crds[c + 5]);
				c += 6;
			}
			else if (cmd == "Q") {
				ctx.quadraticCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3]);
				c += 4;
			}
			else if (cmd.charAt(0) == "#") {
				ctx.beginPath();
				ctx.fillStyle = cmd;
			}
			else if (cmd == "Z") {
				ctx.closePath();
			}
			else if (cmd == "X") {
				ctx.fill();
			}
		}
	}

	public static _drawCFF(cmds, state, font, p) {
		let stack = state.stack;
		let nStems = state.nStems, haveWidth=state.haveWidth, width=state.width, open=state.open;
		let i=0;
		let x=state.x, y=state.y, c1x=0, c1y=0, c2x=0, c2y=0, c3x=0, c3y=0, c4x=0, c4y=0, jpx=0, jpy=0;

		let o = {val:0,size:0};
		while(i<cmds.length)
		{
			Parsers.CFF.getCharString(cmds, i, o);
			let v = o.val.toString();
			i += o.size;

			if(false) {}
			else if(v==="o1" || v==="o18")  //  hstem || hstemhm
			{
				let hasWidthArg;

				// The number of stem operators on the stack is always even.
				// If the value is uneven, that means a width is specified.
				hasWidthArg = stack.length % 2 !== 0;
				if (hasWidthArg && !haveWidth) {
					width = stack.shift() + font.Private.nominalWidthX;
				}

				nStems += stack.length >> 1;
				stack.length = 0;
				haveWidth = true;
			}
			else if(v=="o3" || v=="o23")  // vstem || vstemhm
			{
				let hasWidthArg;

				// The number of stem operators on the stack is always even.
				// If the value is uneven, that means a width is specified.
				hasWidthArg = stack.length % 2 !== 0;
				if (hasWidthArg && !haveWidth) {
					width = stack.shift() + font.Private.nominalWidthX;
				}

				nStems += stack.length >> 1;
				stack.length = 0;
				haveWidth = true;
			}
			else if(v=="o4")
			{
				if (stack.length > 1 && !haveWidth) {
					width = stack.shift() + font.Private.nominalWidthX;
					haveWidth = true;
				}
				if(open) P.closePath(p);

				y += stack.pop();
				P.moveTo(p,x,y);   open=true;
			}
			else if(v=="o5")
			{
				while (stack.length > 0) {
					x += stack.shift();
					y += stack.shift();
					P.lineTo(p, x, y);
				}
			}
			else if(v=="o6" || v=="o7")  // hlineto || vlineto
			{
				let count = stack.length;
				let isX = (v == "o6");

				for(let j=0; j<count; j++) {
					let sval = stack.shift();

					if(isX) x += sval;  else  y += sval;
					isX = !isX;
					P.lineTo(p, x, y);
				}
			}
			else if(v=="o8" || v=="o24")	// rrcurveto || rcurveline
			{
				let count = stack.length;
				let index = 0;
				while(index+6 <= count) {
					c1x = x + stack.shift();
					c1y = y + stack.shift();
					c2x = c1x + stack.shift();
					c2y = c1y + stack.shift();
					x = c2x + stack.shift();
					y = c2y + stack.shift();
					P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
					index+=6;
				}
				if(v=="o24")
				{
					x += stack.shift();
					y += stack.shift();
					P.lineTo(p, x, y);
				}
			}
			else if(v=="o11")  break;
			else if(v=="o1234" || v=="o1235" || v=="o1236" || v=="o1237")//if((v+"").slice(0,3)=="o12")
			{
				if(v=="o1234")
				{
					c1x = x   + stack.shift();    // dx1
					c1y = y;                      // dy1
					c2x = c1x + stack.shift();    // dx2
					c2y = c1y + stack.shift();    // dy2
					jpx = c2x + stack.shift();    // dx3
					jpy = c2y;                    // dy3
					c3x = jpx + stack.shift();    // dx4
					c3y = c2y;                    // dy4
					c4x = c3x + stack.shift();    // dx5
					c4y = y;                      // dy5
					x = c4x + stack.shift();      // dx6
					P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
					P.curveTo(p, c3x, c3y, c4x, c4y, x, y);

				}
				if(v=="o1235")
				{
					c1x = x   + stack.shift();    // dx1
					c1y = y   + stack.shift();    // dy1
					c2x = c1x + stack.shift();    // dx2
					c2y = c1y + stack.shift();    // dy2
					jpx = c2x + stack.shift();    // dx3
					jpy = c2y + stack.shift();    // dy3
					c3x = jpx + stack.shift();    // dx4
					c3y = jpy + stack.shift();    // dy4
					c4x = c3x + stack.shift();    // dx5
					c4y = c3y + stack.shift();    // dy5
					x = c4x + stack.shift();      // dx6
					y = c4y + stack.shift();      // dy6
					stack.shift();                // flex depth
					P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
					P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
				}
				if(v=="o1236")
				{
					c1x = x   + stack.shift();    // dx1
					c1y = y   + stack.shift();    // dy1
					c2x = c1x + stack.shift();    // dx2
					c2y = c1y + stack.shift();    // dy2
					jpx = c2x + stack.shift();    // dx3
					jpy = c2y;                    // dy3
					c3x = jpx + stack.shift();    // dx4
					c3y = c2y;                    // dy4
					c4x = c3x + stack.shift();    // dx5
					c4y = c3y + stack.shift();    // dy5
					x = c4x + stack.shift();      // dx6
					P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
					P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
				}
				if(v=="o1237")
				{
					c1x = x   + stack.shift();    // dx1
					c1y = y   + stack.shift();    // dy1
					c2x = c1x + stack.shift();    // dx2
					c2y = c1y + stack.shift();    // dy2
					jpx = c2x + stack.shift();    // dx3
					jpy = c2y + stack.shift();    // dy3
					c3x = jpx + stack.shift();    // dx4
					c3y = jpy + stack.shift();    // dy4
					c4x = c3x + stack.shift();    // dx5
					c4y = c3y + stack.shift();    // dy5
					if (Math.abs(c4x - x) > Math.abs(c4y - y)) {
						x = c4x + stack.shift();
					} else {
						y = c4y + stack.shift();
					}
					P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
					P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
				}
			}
			else if(v=="o14")
			{
				if (stack.length > 0 && !haveWidth) {
					width = stack.shift() + font.nominalWidthX;
					haveWidth = true;
				}
				if(stack.length==4) // seac = standard encoding accented character
				{

					let asb = 0;
					let adx = stack.shift();
					let ady = stack.shift();
					let bchar = stack.shift();
					let achar = stack.shift();


					let bind = Parsers.CFF.glyphBySE(font, bchar);
					let aind = Parsers.CFF.glyphBySE(font, achar);

					//console.log(bchar, bind);
					//console.log(achar, aind);
					//state.x=x; state.y=y; state.nStems=nStems; state.haveWidth=haveWidth; state.width=width;  state.open=open;

					TyprU._drawCFF(font.CharStrings[bind], state,font,p);
					state.x = adx; state.y = ady;
					TyprU._drawCFF(font.CharStrings[aind], state,font,p);

					//x=state.x; y=state.y; nStems=state.nStems; haveWidth=state.haveWidth; width=state.width;  open=state.open;
				}
				if(open) {  P.closePath(p);  open=false;  }
			}
			else if(v=="o19" || v=="o20")
			{
				let hasWidthArg;

				// The number of stem operators on the stack is always even.
				// If the value is uneven, that means a width is specified.
				hasWidthArg = stack.length % 2 !== 0;
				if (hasWidthArg && !haveWidth) {
					width = stack.shift() + font.Private.nominalWidthX;
				}

				nStems += stack.length >> 1;
				stack.length = 0;
				haveWidth = true;

				i += (nStems + 7) >> 3;
			}

			else if(v=="o21") {
				if (stack.length > 2 && !haveWidth) {
					width = stack.shift() + font.Private.nominalWidthX;
					haveWidth = true;
				}

				y += stack.pop();
				x += stack.pop();

				if(open) P.closePath(p);
				P.moveTo(p,x,y);   open=true;
			}
			else if(v=="o22")
			{
				if (stack.length > 1 && !haveWidth) {
					width = stack.shift() + font.Private.nominalWidthX;
					haveWidth = true;
				}

				x += stack.pop();

				if(open) P.closePath(p);
				P.moveTo(p,x,y);   open=true;
			}
			else if(v=="o25")
			{
				while (stack.length > 6) {
					x += stack.shift();
					y += stack.shift();
					P.lineTo(p, x, y);
				}

				c1x = x + stack.shift();
				c1y = y + stack.shift();
				c2x = c1x + stack.shift();
				c2y = c1y + stack.shift();
				x = c2x + stack.shift();
				y = c2y + stack.shift();
				P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
			}
			else if(v=="o26")
			{
				if (stack.length % 2) {
					x += stack.shift();
				}

				while (stack.length > 0) {
					c1x = x;
					c1y = y + stack.shift();
					c2x = c1x + stack.shift();
					c2y = c1y + stack.shift();
					x = c2x;
					y = c2y + stack.shift();
					P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
				}

			}
			else if(v=="o27")
			{
				if (stack.length % 2) {
					y += stack.shift();
				}

				while (stack.length > 0) {
					c1x = x + stack.shift();
					c1y = y;
					c2x = c1x + stack.shift();
					c2y = c1y + stack.shift();
					x = c2x + stack.shift();
					y = c2y;
					P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
				}
			}
			else if(v=="o10" || v=="o29")	// callsubr || callgsubr
			{
				let obj = (v=="o10" ? font.Private : font);
				if(stack.length==0) { console.log("error: empty stack");  }
				else {
					let ind = stack.pop();
					let subr = obj.Subrs[ ind + obj.Bias ];
					state.x=x; state.y=y; state.nStems=nStems; state.haveWidth=haveWidth; state.width=width;  state.open=open;
					TyprU._drawCFF(subr, state,font,p);
					x=state.x; y=state.y; nStems=state.nStems; haveWidth=state.haveWidth; width=state.width;  open=state.open;
				}
			}
			else if(v=="o30" || v=="o31")   // vhcurveto || hvcurveto
			{
				let count, count1 = stack.length;
				let index = 0;
				let alternate = v == "o31";

				count  = count1 & ~2;
				index += count1 - count;

				while ( index < count )
				{
					if(alternate)
					{
						c1x = x + stack.shift();
						c1y = y;
						c2x = c1x + stack.shift();
						c2y = c1y + stack.shift();
						y = c2y + stack.shift();
						if(count-index == 5) {  x = c2x + stack.shift();  index++;  }
						else x = c2x;
						alternate = false;
					}
					else
					{
						c1x = x;
						c1y = y + stack.shift();
						c2x = c1x + stack.shift();
						c2y = c1y + stack.shift();
						x = c2x + stack.shift();
						if(count-index == 5) {  y = c2y + stack.shift();  index++;  }
						else y = c2y;
						alternate = true;
					}
					P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
					index += 4;
				}
			}

			else if((v+"").charAt(0)=="o") {   console.log("Unknown operation: "+v, cmds); throw v;  }
			else stack.push(v);
		}
		//console.log(cmds);
		state.x=x; state.y=y; state.nStems=nStems; state.haveWidth=haveWidth; state.width=width; state.open=open;
	}
}