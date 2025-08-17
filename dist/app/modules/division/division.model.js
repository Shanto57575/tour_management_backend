"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Division = void 0;
const mongoose_1 = require("mongoose");
const slugify_1 = __importDefault(require("slugify"));
const divisionSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    thumbnail: { type: String },
    description: { type: String },
}, { timestamps: true });
divisionSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = (0, slugify_1.default)(this.name, { lower: true, strict: true });
    }
    next();
});
divisionSchema.pre("findOneAndUpdate", function (next) {
    const division = this.getUpdate();
    if (division.name) {
        division.slug = (0, slugify_1.default)(division.name, { lower: true, strict: true });
    }
    this.setUpdate(division);
    next();
});
exports.Division = (0, mongoose_1.model)("Division", divisionSchema);
