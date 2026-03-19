import type {
  GuideApplicationPayload,
  GuideImageField,
  GuideImagePublicIdField,
} from "./guide.interface";

export const IMAGE_PUBLIC_ID_MAP: Record<
  GuideImageField,
  GuideImagePublicIdField
> = {
  profilePhoto: "profilePhotoPublicId",
  nidFrontPhoto: "nidFrontPublicId",
  nidBackPhoto: "nidBackPublicId",
  licensePhoto: "licensePhotoPublicId",
};

export const REQUIRED_IMAGE_FIELDS: GuideImageField[] = [
  "profilePhoto",
  "nidFrontPhoto",
  "nidBackPhoto",
];

export const APPLICATION_FIELD_KEYS: (keyof GuideApplicationPayload)[] = [
  "dateOfBirth",
  "gender",
  "phone",
  "alternatePhone",
  "presentAddress",
  "permanentAddress",
  "nidNumber",
  "division",
  "district",
  "operatingAreas",
  "languages",
  "experienceYears",
  "specializations",
  "bio",
  "licenseNumber",
  "licenseVerified",
  "bankName",
  "bankAccountNumber",
  "bankBranchName",
  "bkashNumber",
  "nagadNumber",
  "emergencyContactName",
  "emergencyContactPhone",
  "emergencyContactRelation",
];

export const GUIDE_APPLICATION_UPLOAD_FIELDS: {
  name: GuideImageField;
  maxCount: number;
}[] = [
  { name: "profilePhoto", maxCount: 1 },
  { name: "nidFrontPhoto", maxCount: 1 },
  { name: "nidBackPhoto", maxCount: 1 },
  { name: "licensePhoto", maxCount: 1 },
];

export const GUIDE_SEARCHABLE_FIELDS = ["status"] as const;
