import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { otpService } from "./otp.service";

const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  await otpService.sendOTPService(email, name);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP Sent Successfully!",
    data: null,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await otpService.verifyOTPService(email, otp);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP verified Successfully!",
    data: null,
  });
});

export const OTPController = {
  sendOtp,
  verifyOtp,
};
