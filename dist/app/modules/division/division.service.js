"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.divisionService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const division_model_1 = require("./division.model");
const queryBuilder_1 = require("../../utils/queryBuilder");
const division_constant_1 = require("./division.constant");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const slugify_1 = __importDefault(require("slugify"));
const createDivisionService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.name) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Name is required");
    }
    const slug = (0, slugify_1.default)(payload.name, { lower: true, trim: true });
    const isDivisionExists = yield division_model_1.Division.findOne({ name: payload.name });
    if (isDivisionExists) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "division already exists");
    }
    const division = yield division_model_1.Division.create(Object.assign(Object.assign({}, payload), { slug }));
    return division;
});
const getAllDivisionService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(division_model_1.Division.find(), query);
    const allDivisions = queryBuilder
        .filter()
        .search(division_constant_1.divisionSearchableFields)
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        allDivisions.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        meta,
        division: data,
    };
});
const getSingleDivisionService = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    return yield division_model_1.Division.findOne({ slug });
});
const updateDivisionService = (divisionId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingDivision = yield division_model_1.Division.findById(divisionId);
    if (!existingDivision) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Division Not Found!");
    }
    let slug;
    if (payload.name) {
        slug = (0, slugify_1.default)(payload.name, { lower: true, trim: true });
    }
    const updatedDivision = yield division_model_1.Division.findByIdAndUpdate(divisionId, Object.assign(Object.assign({}, payload), { slug }), {
        runValidators: true,
        new: true,
    });
    if (payload.thumbnail && existingDivision.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCloudinary)(existingDivision.thumbnail);
    }
    return updatedDivision;
});
const DeleteDivisionService = (divisionId) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedDivision = yield division_model_1.Division.findByIdAndDelete(divisionId);
    if (!deletedDivision) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "division not found");
    }
    return deletedDivision;
});
exports.divisionService = {
    createDivisionService,
    getAllDivisionService,
    getSingleDivisionService,
    updateDivisionService,
    DeleteDivisionService,
};
