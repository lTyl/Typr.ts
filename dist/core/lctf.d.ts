export declare class Lctf {
    static parse(data: any, offset: any, length: any, font: any, subt: any): any;
    static readLookupList(data: any, offset: any, subt: any): any;
    static readLookupTable(data: any, offset: any, subt: any): any;
    static numOfOnes(n: number): any;
    static readClassDef(data: any, offset: any): any;
    static getInterval(tab: any, val: any): any;
    static readValueRecord(data: any, offset: any, valFmt: any): any;
    static readCoverage(data: any, offset: any): any;
    static coverageIndex(cvg: any, val: any): any;
    static readFeatureList(data: any, offset: any): any;
    static readFeatureTable(data: any, offset: any): any;
    static readScriptList(data: any, offset: any): any;
    static readScriptTable(data: any, offset: any): any;
    static readLangSysTable(data: any, offset: any): any;
}
