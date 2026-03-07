import { z } from "zod";
import { GuideApplicationStatus } from "./guide.interface";

export const createGuideApplicationZodSchema = z.object({
  divisionId: z.string({
    required_error: "Division ID is required",
  }),
});

export const updateGuideStatusZodSchema = z.object({
  status: z.enum(
    [GuideApplicationStatus.APPROVED, GuideApplicationStatus.REJECTED],
    {
      required_error: "Status is required",
      invalid_type_error: "Status must be APPROVED or REJECTED",
    },
  ),
  rejectionReason: z.string().optional(),
});
