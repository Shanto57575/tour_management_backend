import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatsService } from "./stats.service";

const getBookingStats = catchAsync(async (req, res) => {
  const stats = await StatsService.getBookingStatsService();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking stats retrieved successfully",
    data: stats,
  });
});

const getPaymentStats = catchAsync(async (req, res) => {
  const stats = await StatsService.getPaymentStatsService();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "payment stats retrieved successfully",
    data: stats,
  });
});

const getUserStats = catchAsync(async (req, res) => {
  const stats = await StatsService.getUserStatsService();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "user stats retrieved successfully",
    data: stats,
  });
});

const getTourStats = catchAsync(async (req, res) => {
  const stats = await StatsService.getTourStatsService();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "tour stats retrieved successfully",
    data: stats,
  });
});

export const StatsController = {
  getBookingStats,
  getPaymentStats,
  getUserStats,
  getTourStats,
};
