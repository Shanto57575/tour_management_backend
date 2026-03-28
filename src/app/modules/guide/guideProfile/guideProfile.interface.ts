import { Types } from "mongoose";

export interface IGuideProfile {
  user: Types.ObjectId;
  application: Types.ObjectId;

  avgRating: number;
  totalReviews: number;
  ratingBreakdown: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };

  // Tour Stats
  completedTours: number;
  cancelledTours: number;
  ongoingTourId: Types.ObjectId | null;

  // Availability
  isAvailable: boolean;
  isActive: boolean;

  // Response Rate
  responseRate: number;
  totalRequests: number;
  acceptedRequests: number;

  // Featured / Badges
  isFeatured: boolean;
  badges: (
    | "TOP-RATED"
    | "EXPERIENCED"
    | "QUICK-RESPONDER"
    | "LOCAL-EXPERT"
    | "ECO-FRIENDLY"
  )[];

  // Activity
  lastActiveAt: Date;

  // timestamps (from mongoose)
  createdAt?: Date;
  updatedAt?: Date;
}