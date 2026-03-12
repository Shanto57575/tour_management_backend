import { Schema } from "mongoose";

export interface IDestination {
  name: string;
  slug?: string;
  summary?: string;
  description?: string;
  images?: string[];
  startingPrice?: number;
  duration?: string;
  district?: string;
  attractions?: string[];
  bestTimeToVisit?: string;
  division: Schema.Types.ObjectId;
  isFeatured?: boolean;
}
