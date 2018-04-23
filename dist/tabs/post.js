"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../core/");
class Post {
    static parse(data, offset, length) {
        let obj = {};
        obj.version = _1.Bin.readFixed(data, offset);
        offset += 4;
        obj.italicAngle = _1.Bin.readFixed(data, offset);
        offset += 4;
        obj.underlinePosition = _1.Bin.readShort(data, offset);
        offset += 2;
        obj.underlineThickness = _1.Bin.readShort(data, offset);
        offset += 2;
        return obj;
    }
}
exports.Post = Post;
//# sourceMappingURL=post.js.map