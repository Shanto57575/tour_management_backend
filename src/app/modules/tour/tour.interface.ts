import { Types } from "mongoose";

export interface ITourType {
  name: string;
}

export interface ITour {
  title: string;
  slug: string;
  description?: string;
  images?: string[];
  location?: string;
  costFrom?: number;
  discount?: number;
  destination: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  included?: string[];
  excluded?: string[];
  amenities?: string[];
  tourPlan?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  departureLocation: string;
  arrivalLocation: string;
  averageRating?: number;
  totalReviews?: number;
  status?: string;
  maxGuest?: number;
  minAge?: number;
  division: Types.ObjectId;
  tourType: Types.ObjectId;
  deleteImages?: string[];
}
