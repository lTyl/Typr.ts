import { Bin, Typr } from "../core/";

export class Glyf {
	public static parse(data, offset, length, font): any {
		let obj: any = [];
		for(let g = 0; g < font.maxp.numGlyphs; g++) {obj.push(null);}
		return obj;
	}
	
	public static _parseGlyf(font, g): any {
		let data = font._data;
		
		let offset = Typr._tabOffset(data, "glyf") + font.loca[g];
		
		if(font.loca[g] === font.loca[g+1]) {return null;}
		
		let gl: any = {};
		
		gl.noc  = Bin.readShort(data, offset);  offset += 2;		// number of contours
		gl.xMin = Bin.readShort(data, offset);  offset += 2;
		gl.yMin = Bin.readShort(data, offset);  offset += 2;
		gl.xMax = Bin.readShort(data, offset);  offset += 2;
		gl.yMax = Bin.readShort(data, offset);  offset += 2;
		
		if(gl.xMin >= gl.xMax || gl.yMin >= gl.yMax) {return null;}
		
		if(gl.noc > 0) {
			gl.endPts = [];
			for(let i = 0; i < gl.noc; i++) { gl.endPts.push(Bin.readUshort(data,offset)); offset += 2; }
			
			let instructionLength = Bin.readUshort(data, offset); offset += 2;
			if((data.length - offset) < instructionLength) {return null;}
			gl.instructions = Bin.readBytes(data, offset, instructionLength); offset += instructionLength;
			
			let crdnum = gl.endPts[gl.noc - 1] + 1;
			gl.flags = [];
			for(let i = 0; i < crdnum; i++) {
				let flag = data[offset];  offset++;
				gl.flags.push(flag);
				if((flag & 8) !== 0) {
					let rep = data[offset];  offset++;
					for(let j = 0; j < rep; j++) { gl.flags.push(flag); i++; }
				}
			}
			gl.xs = [];
			for(let i = 0; i < crdnum; i++) {
				let i8=((gl.flags[i] & 2) !== 0), same=((gl.flags[i] & 16) !== 0);
				if(i8){ gl.xs.push(same ? data[offset] : -data[offset]);  offset++; }
				else {
					if(same){gl.xs.push(0);}
					else { gl.xs.push(Bin.readShort(data, offset));  offset += 2; }
				}
			}
			gl.ys = [];
			for(let i = 0; i < crdnum; i++) {
				let i8=((gl.flags[i] & 4) !== 0), same=((gl.flags[i] & 32) !== 0);
				if(i8) { gl.ys.push(same ? data[offset] : -data[offset]);  offset++; }
				else {
					if(same) {gl.ys.push(0);}
					else { gl.ys.push(Bin.readShort(data, offset));  offset += 2; }
				}
			}
			let x = 0, y = 0;
			for(let i = 0; i < crdnum; i++) { x += gl.xs[i]; y += gl.ys[i];  gl.xs[i] = x;  gl.ys[i] = y; }
		}
		else
		{
			let ARG_1_AND_2_ARE_WORDS	= 1<<0;
			let ARGS_ARE_XY_VALUES		= 1<<1;
			let ROUND_XY_TO_GRID		= 1<<2;
			let WE_HAVE_A_SCALE			= 1<<3;
			let RESERVED				= 1<<4;
			let MORE_COMPONENTS			= 1<<5;
			let WE_HAVE_AN_X_AND_Y_SCALE= 1<<6;
			let WE_HAVE_A_TWO_BY_TWO	= 1<<7;
			let WE_HAVE_INSTRUCTIONS	= 1<<8;
			let USE_MY_METRICS			= 1<<9;
			let OVERLAP_COMPOUND		= 1<<10;
			let SCALED_COMPONENT_OFFSET	= 1<<11;
			let UNSCALED_COMPONENT_OFFSET	= 1<<12;
			
			gl.parts = [];
			let flags;
			do {
				flags = Bin.readUshort(data, offset);  offset += 2;
				let part: any = { m: {a: 1,b: 0,c: 0,d: 1,tx: 0,ty: 0}, p1: -1, p2: -1 };  gl.parts.push(part);
				part.glyphIndex = Bin.readUshort(data, offset);  offset += 2;
				let arg1, arg2;
				if (flags & ARG_1_AND_2_ARE_WORDS) {
					arg1 = Bin.readShort(data, offset);  offset += 2;
					arg2 = Bin.readShort(data, offset);  offset += 2;
				} else {
					arg1 = Bin.readInt8(data, offset);  offset++;
					arg2 = Bin.readInt8(data, offset);  offset++;
				}
				
				if(flags & ARGS_ARE_XY_VALUES) { part.m.tx = arg1;  part.m.ty = arg2; }
				else  {part.p1=arg1;  part.p2=arg2;}
				
				if ( flags & WE_HAVE_A_SCALE ) {
					part.m.a = part.m.d = Bin.readF2dot14(data, offset);  offset += 2;
				} else if ( flags & WE_HAVE_AN_X_AND_Y_SCALE ) {
					part.m.a = Bin.readF2dot14(data, offset);  offset += 2;
					part.m.d = Bin.readF2dot14(data, offset);  offset += 2;
				} else if ( flags & WE_HAVE_A_TWO_BY_TWO ) {
					part.m.a = Bin.readF2dot14(data, offset);  offset += 2;
					part.m.b = Bin.readF2dot14(data, offset);  offset += 2;
					part.m.c = Bin.readF2dot14(data, offset);  offset += 2;
					part.m.d = Bin.readF2dot14(data, offset);  offset += 2;
				}
			} while (flags & MORE_COMPONENTS);
			
			if (flags & WE_HAVE_INSTRUCTIONS) {
				let numInstr = Bin.readUshort(data, offset);  offset += 2;
				gl.instr = [];
				for(let i = 0; i < numInstr; i++) { gl.instr.push(data[offset]);  offset++; }
			}
		}
		return gl;
	}
}