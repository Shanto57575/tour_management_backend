/* eslint-disable no-console */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Tour } from "../app/modules/tour/tour.model";

dotenv.config();

const DB_URL = process.env.DB_URL;
const DRY_RUN = process.env.DRY_RUN === "true";

const getStartOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const resetTourBookings = async () => {
  if (!DB_URL) {
    throw new Error("DB_URL is not defined in environment variables");
  }

  await mongoose.connect(DB_URL);

  const startOfToday = getStartOfToday();

  const [totalTours, expiredTours, activeWindowTours] = await Promise.all([
    Tour.countDocuments(),
    Tour.countDocuments({ endDate: { $lt: startOfToday } }),
    Tour.countDocuments({
      $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: startOfToday } }],
    }),
  ]);

  console.log("Tour booking reset summary:");
  console.log(`- Total tours: ${totalTours}`);
  console.log(`- Expired tours: ${expiredTours}`);
  console.log(`- Non-expired tours: ${activeWindowTours}`);
  console.log(`- DRY_RUN: ${DRY_RUN}`);

  if (DRY_RUN) {
    console.log("Dry run enabled. No changes were applied.");
    return;
  }

  const resetBookedCountResult = await Tour.updateMany({}, { $set: { bookedCount: 0 } });

  const enableAvailableResult = await Tour.updateMany(
    {
      $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: startOfToday } }],
    },
    { $set: { isAvailable: true } },
  );

  const expireStateResult = await Tour.updateMany(
    { endDate: { $lt: startOfToday } },
    { $set: { isAvailable: false, status: "inactive" } },
  );

  console.log("Reset completed:");
  console.log(`- bookedCount reset matched: ${resetBookedCountResult.matchedCount}, modified: ${resetBookedCountResult.modifiedCount}`);
  console.log(`- non-expired availability matched: ${enableAvailableResult.matchedCount}, modified: ${enableAvailableResult.modifiedCount}`);
  console.log(`- expired state matched: ${expireStateResult.matchedCount}, modified: ${expireStateResult.modifiedCount}`);
};

resetTourBookings()
  .then(() => {
    console.log("resetTourBookings finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("resetTourBookings failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
