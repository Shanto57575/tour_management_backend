import { Types } from "mongoose";

export interface ITourType {
  name: string;
}

export interface ITourPlan {
  day: number;
  title: string;
  description?: string;
  meals?: string[];
}

export interface ITour {
  title: string;
  slug: string;
  description?: string;
  images?: string[];
  tags?: string[];
  pricePerPerson: number;
  discount?: number;
  division: Types.ObjectId;
  district: Types.ObjectId;
  destination: Types.ObjectId;
  departureLocation?: string;
  arrivalLocation?: string;
  guide?: Types.ObjectId;
  tourType: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  durationDays?: number;
  durationNights?: number;
  maxGuest?: number;
  minAge?: number;
  bookedCount: number;
  groupType?: "private" | "group" | "both";
  difficulty?: "easy" | "moderate" | "hard";
  languages?: string[];
  included?: string[];
  excluded?: string[];
  amenities?: string[];
  tourPlan?: ITourPlan[];
  cancellationPolicy?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isAvailable?: boolean;
  averageRating?: number;
  totalReviews?: number;
  status?: "active" | "inactive";
}
