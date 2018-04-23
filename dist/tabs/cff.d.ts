export declare class CFF {
    static tableSE: number[];
    static parse(data: any, offset: any, length: any): {};
    static glyphBySE(cff: any, charcode: any): any;
    static readSubrs(data: any, offset: any, obj: any): any;
    static glyphByUnicode(cff: any, code: any): any;
    static readEncoding(data: any, offset: any, num: any): any;
    static readCharset(data: any, offset: any, num: any): any;
    static readIndex(data: any, offset: any, inds: any): any;
    static getCharString(data: any, offset: any, o: any): any;
    static readCharString(data: any, offset: any, length: any): any;
    static readDict(data: any, offset: any, end: any): any;
}
