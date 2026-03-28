/* eslint-disable no-console */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Tour } from "../app/modules/tour/tour.model";

dotenv.config();

const DB_URL = process.env.DB_URL;
const DRY_RUN = process.env.DRY_RUN === "true";
const MS_IN_DAY = 24 * 60 * 60 * 1000;
const WINDOW_START = new Date("2026-05-01T00:00:00.000Z");
const WINDOW_END = new Date("2028-12-31T23:59:59.999Z");

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * MS_IN_DAY);

const getDurationDays = (tour: {
  durationDays?: number;
  durationNights?: number;
  startDate?: Date;
  endDate?: Date;
}) => {
  if (typeof tour.durationDays === "number" && tour.durationDays >= 1) {
    return Math.floor(tour.durationDays);
  }

  if (tour.startDate && tour.endDate) {
    const diff = Math.floor((tour.endDate.getTime() - tour.startDate.getTime()) / MS_IN_DAY) + 1;
    if (diff >= 1) return diff;
  }

  if (typeof tour.durationNights === "number" && tour.durationNights >= 0) {
    return Math.floor(tour.durationNights) + 1;
  }

  return 1;
};

const clampDurationToWindow = (durationDays: number) => {
  const windowSpanDays = Math.floor((WINDOW_END.getTime() - WINDOW_START.getTime()) / MS_IN_DAY) + 1;
  return Math.min(Math.max(durationDays, 1), Math.max(windowSpanDays, 1));
};

const getDistributedStartDate = (index: number, total: number, durationDays: number) => {
  const latestStart = addDays(WINDOW_END, -(durationDays - 1));
  const startMs = WINDOW_START.getTime();
  const endMs = Math.max(latestStart.getTime(), startMs);

  if (total <= 1 || endMs <= startMs) {
    return new Date(startMs);
  }

  const ratio = index / (total - 1);
  return new Date(startMs + Math.floor((endMs - startMs) * ratio));
};

const migrateTourDates = async () => {
  if (!DB_URL) {
    throw new Error("DB_URL is not defined in environment variables");
  }

  await mongoose.connect(DB_URL);

  const tours = await Tour.find({}).select("startDate endDate durationDays durationNights status isAvailable").sort({ _id: 1 });

  console.log("Tour date migration summary:");
  console.log(`- Total tours: ${tours.length}`);
  console.log(`- Window: ${WINDOW_START.toISOString()} to ${WINDOW_END.toISOString()}`);
  console.log(`- DRY_RUN: ${DRY_RUN}`);

  if (!tours.length) {
    console.log("No tours found. Nothing to migrate.");
    return;
  }

  let updated = 0;

  for (let i = 0; i < tours.length; i++) {
    const tour = tours[i];
    const rawDuration = getDurationDays({
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      startDate: tour.startDate,
      endDate: tour.endDate,
    });

    const durationDays = clampDurationToWindow(rawDuration);
    const newStartDate = getDistributedStartDate(i, tours.length, durationDays);
    const newEndDate = addDays(newStartDate, durationDays - 1);

    if (!DRY_RUN) {
      await Tour.updateOne(
        { _id: tour._id },
        {
          $set: {
            startDate: newStartDate,
            endDate: newEndDate,
            durationDays,
            durationNights: Math.max(durationDays - 1, 0),
          },
        },
      );
    }

    updated++;
  }

  console.log(`- Tours processed: ${updated}`);
  if (DRY_RUN) {
    console.log("Dry run enabled. No changes were applied.");
  } else {
    console.log("Tour dates migrated successfully.");
  }
};

migrateTourDates()
  .then(() => {
    console.log("migrateTourDatesTo2026_2028 finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("migrateTourDatesTo2026_2028 failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
