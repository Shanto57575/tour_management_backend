import { Types } from "mongoose";

export enum GuideApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IStatusLog {
  status: GuideApplicationStatus;
  reason?: string | null;
  changedBy: Types.ObjectId;
  changedAt?: Date;
}

export interface IGuideApplication {
  _id?: Types.ObjectId;
  user: Types.ObjectId;

  // Personal Info
  profilePhoto: string;
  profilePhotoPublicId?: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  phone: string;
  alternatePhone?: string;
  presentAddress: string;
  permanentAddress: string;

  // Identity
  nidNumber: string;
  nidFrontPhoto: string;
  nidBackPhoto: string;
  nidFrontPublicId?: string;
  nidBackPublicId?: string;

  // Location
  division: Types.ObjectId;
  district: Types.ObjectId;
  operatingAreas?: string[];

  // Professional
  languages: string[];
  experienceYears?: number;
  specializations?: string[];
  bio?: string;

  // License
  licenseNumber?: string;
  licensePhoto?: string;
  licensePhotoPublicId?: string;
  licenseVerified?: boolean;

  // Payment
  bankName?: string;
  bankAccountNumber?: string;
  bankBranchName?: string;
  bkashNumber?: string;
  nagadNumber?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Application Workflow
  status: GuideApplicationStatus;
  submittedAt?: Date;
  resubmissionCount?: number;
  nidVerified?: boolean;
  statusHistory: IStatusLog[];

  createdAt?: Date;
  updatedAt?: Date;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export type GuideImageField =
  | "profilePhoto"
  | "nidFrontPhoto"
  | "nidBackPhoto"
  | "licensePhoto";

export type GuideImagePublicIdField =
  | "profilePhotoPublicId"
  | "nidFrontPublicId"
  | "nidBackPublicId"
  | "licensePhotoPublicId";

export type GuideApplicationFiles = Partial<
  Record<GuideImageField, Express.Multer.File[]>
>;

export interface GuideApplicationPayload {
  profilePhoto?: string;
  profilePhotoPublicId?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  phone?: string;
  alternatePhone?: string;
  presentAddress?: string;
  permanentAddress?: string;
  nidNumber?: string;
  nidFrontPhoto?: string;
  nidBackPhoto?: string;
  nidFrontPublicId?: string;
  nidBackPublicId?: string;
  division?: string;
  district?: string;
  operatingAreas?: string[];
  languages?: string[];
  experienceYears?: number;
  specializations?: string[];
  bio?: string;
  licenseNumber?: string;
  licensePhoto?: string;
  licensePhotoPublicId?: string;
  licenseVerified?: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankBranchName?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}
