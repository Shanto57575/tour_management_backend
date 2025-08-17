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
exports.TourService = void 0;
const cloudinary_config_1 = require("../../config/cloudinary.config");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const queryBuilder_1 = require("../../utils/queryBuilder");
const tour_constant_1 = require("./tour.constant");
const tour_model_1 = require("./tour.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createTourTypeService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isTourTypeExists = yield tour_model_1.TourType.findOne({ payload });
    if (isTourTypeExists) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Tour Type already exists!");
    }
    const newTourType = yield tour_model_1.TourType.create(payload);
    return newTourType;
});
const getAllTourTypeService = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield tour_model_1.TourType.find().sort({ createdAt: -1 });
});
const getSingleTourTypeService = (tourTypeId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield tour_model_1.TourType.findById(tourTypeId);
});
const updateTourTypeService = (tourTypeId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const updateTourType = yield tour_model_1.TourType.findByIdAndUpdate(tourTypeId, payload, {
        new: true,
    });
    if (!updateTourType) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Tour Type Not Found!");
    }
    return updateTourType;
});
const deleteTourTypeService = (tourTypeId) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteTourType = yield tour_model_1.TourType.findByIdAndDelete(tourTypeId);
    if (!deleteTourType) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Tour Type Not Found!");
    }
    return deleteTourType;
});
const createTourService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const tourInfo = yield tour_model_1.Tour.create(payload);
    return tourInfo;
});
const getAllTourService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(tour_model_1.Tour.find(), query);
    const tours = queryBuilder
        .filter()
        .search(tour_constant_1.tourSearchableFields)
        .fields()
        .sort()
        .paginate();
    const [data, meta] = yield Promise.all([
        tours.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        meta,
        tours: data,
    };
});
const getSingleTourService = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    return yield tour_model_1.Tour.findOne({ slug });
});
const updateTourService = (tourId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isTourExist = yield tour_model_1.Tour.findById(tourId);
    if (!isTourExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Tour Not Found");
    }
    // option : 1
    // if (
    //   payload.images &&
    //   payload.images.length > 0 &&
    //   isTourExist.images &&
    //   isTourExist.images.length > 0
    // ) {
    //   payload.images = [...payload.images, ...isTourExist.images];
    // }
    // option : 2 (here if adding new image we must keep the previous images too)
    payload.images = [...(payload.images || []), ...(isTourExist.images || [])];
    if (payload.deleteImages && isTourExist.images) {
        const restDbImages = isTourExist.images.filter((imageUrl) => { var _a; return !((_a = (payload.images || [])) === null || _a === void 0 ? void 0 : _a.includes(imageUrl)); });
        const updatedPayloadImages = (payload.images || [])
            .filter((imageUrl) => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imageUrl)); })
            .filter((imageUrl) => !restDbImages.includes(imageUrl));
        payload.images = [...restDbImages, ...updatedPayloadImages];
    }
    const updatedTourInfo = yield tour_model_1.Tour.findByIdAndUpdate(tourId, payload, {
        new: true,
    });
    if (payload.deleteImages && isTourExist.images) {
        yield Promise.all(payload.deleteImages.map((url) => (0, cloudinary_config_1.deleteImageFromCloudinary)(url)));
    }
    return updatedTourInfo;
});
const deleteTourService = (tourId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield tour_model_1.Tour.findByIdAndDelete(tourId);
});
exports.TourService = {
    // Tour Type
    createTourTypeService,
    updateTourTypeService,
    getAllTourTypeService,
    getSingleTourTypeService,
    deleteTourTypeService,
    // TOUR
    createTourService,
    getAllTourService,
    getSingleTourService,
    updateTourService,
    deleteTourService,
};
