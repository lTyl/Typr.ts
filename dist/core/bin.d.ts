import { TextDecoder } from "text-encoding";
export declare class Bin {
    static _tdec: TextDecoder;
    static buff: ArrayBuffer;
    static t: {
        buff: ArrayBuffer;
        int8: Int8Array;
        uint8: Uint8Array;
        int16: Int16Array;
        uint16: Uint16Array;
        int32: Int32Array;
        uint32: Uint32Array;
    };
    static readFixed(data: any, o: any): number;
    static readF2dot14(data: any, o: any): number;
    static readInt(buff: any, p: any): number;
    static readInt8(buff: any, p: any): number;
    static readShort(buff: any, p: any): number;
    static readUshort(buff: any, p: any): number;
    static readUshorts(buff: any, p: any, len: any): any[];
    static readUint(buff: any, p: any): number;
    static readUint64(buff: any, p: any): number;
    static readASCII(buff: any, p: any, l: any): string;
    static readUnicode(buff: any, p: any, l: any): string;
    static readUTF8(buff: any, p: any, l: any): any;
    static readBytes(buff: any, p: any, l: any): any[];
    static readASCIIArray(buff: any, p: any, l: any): any[];
}
