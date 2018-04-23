export declare class TyprU {
    static codeToGlyph(font: any, code: any): any;
    static glyphToPath(font: any, gid: any): any;
    static _drawGlyf(gid: any, font: any, path: any): any;
    static _compoGlyph(gl: any, font: any, p: any): void;
    static _simpleGlyph(gl: any, p: any): any;
    static _compGlyph(gl: any, font: any, p: any): any;
    static _getGlyphClass(g: any, cd: any): any;
    static getPairAdjustment(font: any, g1: any, g2: any): any;
    static stringToGlyphs(font: any, str: any): any;
    static _applyType1(gls: any, ci: any, tab: any): any;
    static glyphsToPath(font: any, gls: any, clr: any): any;
    static pathToSVG(path: any, prec: any): any;
    static pathToContext(path: any, ctx: any): any;
    static _drawCFF(cmds: any, state: any, font: any, p: any): void;
}
