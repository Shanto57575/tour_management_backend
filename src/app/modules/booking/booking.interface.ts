import { Types } from "mongoose";

export enum BOOKING_STATUS {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export interface IBookingContactInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface IBooking {
  user: Types.ObjectId;
  tour: Types.ObjectId;
  guestCount: number;
  bookingDate: Date;
  pricePerPerson: number;
  discount?: number;
  totalPrice: number;
  contactInfo: IBookingContactInfo;
  specialRequests?: string;
  status: BOOKING_STATUS;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt?: Date;
}
