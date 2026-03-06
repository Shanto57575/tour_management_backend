import { Types } from "mongoose";

export enum GuideApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
}

export interface IGuideApplication {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  nidPhoto: string;
  division: Types.ObjectId;
  status: GuideApplicationStatus;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}
