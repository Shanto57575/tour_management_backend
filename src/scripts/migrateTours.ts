import mongoose from "mongoose";
import dotenv from "dotenv";
import { Tour } from "../app/modules/tour/tour.model";
import { Destination } from "../app/modules/destination/destination.model";
import { Division } from "../app/modules/division/division.model";
import { envVars } from "../app/config/env";

// Load env variables
dotenv.config();

const migrateTours = async () => {
  try {
    const dbUrl = envVars.DB_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not defined in .env file");
    }

    console.log("Connecting to database...");
    await mongoose.connect(dbUrl);
    console.log("Connected to database successfully.");

    // 1. Get all tours
    const tours = await Tour.find();
    console.log(`Found ${tours.length} tours in the database.`);

    if (tours.length === 0) {
      console.log("No tours to migrate. Exiting...");
      process.exit(0);
    }

    // 2. Find a division to use as a fallback if we need to create a default destination
    const firstDivision = await Division.findOne();
    if (!firstDivision) {
      console.log(
        "No divisions found in the database. Please create a division first before running this migration, as destination requires a division.",
      );
      process.exit(1);
    }

    // 3. Find or create a default destination to assign to existing tours
    let defaultDestination = await Destination.findOne({
      name: "General Destination",
    });

    if (!defaultDestination) {
      console.log(
        "Creating default 'General Destination' for existing tours...",
      );
      defaultDestination = await Destination.create({
        name: "General Destination",
        description: "Default destination for migrated tours",
        division: firstDivision._id,
        isFeatured: false,
      });
    }

    // 4. Update tours
    let updatedCount = 0;

    for (const tour of tours) {
      let needsUpdate = false;

      // We will perform a direct update to bypass some validation if needed,
      // but Mongoose `save()` is safer to trigger hooks like slugify.

      const updatePayload: any = {};

      if (!tour.destination) {
        updatePayload.destination = defaultDestination._id;
        needsUpdate = true;
      }

      if (tour.discount === undefined) {
        updatePayload.discount = 0;
        needsUpdate = true;
      }

      if (tour.isFeatured === undefined) {
        updatePayload.isFeatured = false;
        needsUpdate = true;
      }

      if (tour.isTrending === undefined) {
        updatePayload.isTrending = false;
        needsUpdate = true;
      }

      if (tour.averageRating === undefined) {
        updatePayload.averageRating = 0;
        needsUpdate = true;
      }

      if (tour.totalReviews === undefined) {
        updatePayload.totalReviews = 0;
        needsUpdate = true;
      }

      if (tour.status === undefined) {
        updatePayload.status = "active";
        needsUpdate = true;
      }

      if (needsUpdate) {
        // Using updateOne allows bypassing full document validation if a document was
        // previously saved with missing currently-required fields, though
        // providing the missing fields here should fix it.
        await Tour.updateOne({ _id: tour._id }, { $set: updatePayload });
        updatedCount++;
        console.log(`Updated tour: ${tour.title || tour._id}`);
      }
    }

    console.log(
      `Migration completed successfully. Updated ${updatedCount} tours.`,
    );
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Note: If the dev server is running, you might not want to close this if imported elsewhere,
    // but as a standalone script, we need to exit.
    mongoose.disconnect();
    process.exit(0);
  }
};

// Run the migration
migrateTours();
