/* eslint-disable no-console */

import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";

import { envVars } from "../app/config/env";
import { Destination } from "../app/modules/destination/destination.model";

dotenv.config();

interface DestinationSeedPayload {
  name: string;
  summary: string;
  description: string;
  images: string[];
  startingPrice: number;
  duration: string;
  district: string;
  attractions: string[];
  bestTimeToVisit: string;
  division: string;
  isFeatured: boolean;
}

const destinations: DestinationSeedPayload[] = [
  {
    name: "Sundarbans",
    summary:
      "The largest mangrove forest in the world and home of the Royal Bengal Tiger.",
    description:
      "The Sundarbans is a UNESCO World Heritage Site located in the southwestern part of Bangladesh. It is famous for its dense mangrove forests, intricate river networks, and unique biodiversity. Visitors can experience wildlife such as Royal Bengal Tigers, spotted deer, crocodiles, and various bird species. Boat safaris through the forest provide an unforgettable experience of nature.",
    images: [
      "https://images.unsplash.com/photo-1605649487212-47bdab064dfd",
      "https://images.unsplash.com/photo-1573497019419-4a3c42c90c77",
    ],
    startingPrice: 12000,
    duration: "3-5 days",
    district: "Khulna",
    attractions: ["Mangrove Forest", "Tiger Point", "Karamjal Wildlife Center"],
    bestTimeToVisit: "November to February",
    division: "65f1a1a1a1a1a1a1a1a1a101",
    isFeatured: true,
  },
  {
    name: "Cox's Bazar",
    summary: "The longest natural sea beach in the world.",
    description:
      "Cox's Bazar is famous for its uninterrupted sandy beach stretching over 120 km. It offers breathtaking sunsets, fresh seafood, and relaxing beach vibes. Popular spots include Laboni Beach, Inani Beach, and Himchari National Park. It is the most visited tourist destination in Bangladesh.",
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
    ],
    startingPrice: 8000,
    duration: "2-3 days",
    district: "Cox's Bazar",
    attractions: ["Laboni Beach", "Inani Beach", "Himchari"],
    bestTimeToVisit: "October to March",
    division: "65f1a1a1a1a1a1a1a1a1a102",
    isFeatured: true,
  },
  {
    name: "Bandarban",
    summary:
      "A hill district known for its scenic beauty and tribal culture.",
    description:
      "Bandarban is a paradise for nature lovers with its hills, waterfalls, and tribal communities. It offers places like Nilgiri, Nilachal, Boga Lake, and Nafakhum Waterfall. Trekking and exploring indigenous culture make it a unique experience.",
    images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"],
    startingPrice: 9000,
    duration: "3-4 days",
    district: "Bandarban",
    attractions: ["Nilgiri", "Boga Lake", "Nafakhum"],
    bestTimeToVisit: "October to March",
    division: "65f1a1a1a1a1a1a1a1a1a102",
    isFeatured: true,
  },
  {
    name: "Kuakata",
    summary:
      "The daughter of the sea known for both sunrise and sunset views.",
    description:
      "Kuakata is unique because visitors can see both sunrise and sunset over the Bay of Bengal. It is less crowded compared to Cox's Bazar and offers peaceful surroundings with scenic beauty and local culture.",
    images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470"],
    startingPrice: 7000,
    duration: "2-3 days",
    district: "Patuakhali",
    attractions: ["Kuakata Beach", "Gangamati Reserve Forest"],
    bestTimeToVisit: "November to March",
    division: "65f1a1a1a1a1a1a1a1a1a103",
    isFeatured: true,
  },
  {
    name: "Saint Martin's Island",
    summary: "The only coral island in Bangladesh.",
    description:
      "Saint Martin's Island is famous for its crystal clear water, coral reefs, and peaceful environment. It is ideal for relaxation, swimming, and enjoying fresh seafood.",
    images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"],
    startingPrice: 10000,
    duration: "2-3 days",
    district: "Cox's Bazar",
    attractions: ["Coral Beach", "Chera Dwip"],
    bestTimeToVisit: "November to February",
    division: "65f1a1a1a1a1a1a1a1a1a102",
    isFeatured: true,
  },
  {
    name: "Rangamati",
    summary: "A lake city surrounded by hills and greenery.",
    description:
      "Rangamati is famous for Kaptai Lake, hanging bridge, and tribal culture. It offers boating experiences and scenic landscapes.",
    images: ["https://images.unsplash.com/photo-1500534314209-a25ddb2bd429"],
    startingPrice: 6000,
    duration: "2-3 days",
    district: "Rangamati",
    attractions: ["Kaptai Lake", "Hanging Bridge"],
    bestTimeToVisit: "October to March",
    division: "65f1a1a1a1a1a1a1a1a1a102",
    isFeatured: false,
  },
  {
    name: "Sylhet",
    summary: "A region of tea gardens and natural beauty.",
    description:
      "Sylhet is famous for its tea gardens, Ratargul Swamp Forest, and Jaflong. It offers serene landscapes and cultural richness.",
    images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470"],
    startingPrice: 7000,
    duration: "2-4 days",
    district: "Sylhet",
    attractions: ["Jaflong", "Ratargul"],
    bestTimeToVisit: "June to January",
    division: "65f1a1a1a1a1a1a1a1a1a104",
    isFeatured: true,
  },
  {
    name: "Srimangal",
    summary: "Tea capital of Bangladesh.",
    description:
      "Srimangal is known for its endless tea gardens, Lawachara National Park, and the famous seven-layer tea.",
    images: ["https://images.unsplash.com/photo-1477587458883-47145ed94245"],
    startingPrice: 6000,
    duration: "2 days",
    district: "Moulvibazar",
    attractions: ["Lawachara", "Tea Gardens"],
    bestTimeToVisit: "October to March",
    division: "65f1a1a1a1a1a1a1a1a1a104",
    isFeatured: false,
  },
  {
    name: "Paharpur",
    summary: "An ancient Buddhist monastery.",
    description:
      "Somapura Mahavihara in Paharpur is one of the most important archaeological sites in South Asia.",
    images: ["https://images.unsplash.com/photo-1585506942812-e72b29cef752"],
    startingPrice: 3000,
    duration: "1 day",
    district: "Naogaon",
    attractions: ["Somapura Mahavihara"],
    bestTimeToVisit: "November to February",
    division: "65f1a1a1a1a1a1a1a1a1a105",
    isFeatured: false,
  },
  {
    name: "Mahasthangarh",
    summary: "Ancient archaeological site.",
    description:
      "Mahasthangarh is one of the earliest urban archaeological sites in Bangladesh.",
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
    startingPrice: 2000,
    duration: "1 day",
    district: "Bogra",
    attractions: ["Ancient ruins"],
    bestTimeToVisit: "October to March",
    division: "65f1a1a1a1a1a1a1a1a1a105",
    isFeatured: false,
  },
  {
    name: "Sajek Valley",
    summary: "Cloud kingdom of Bangladesh.",
    description:
      "Sajek Valley offers breathtaking views of clouds, hills, and sunrise. It is one of the most popular travel spots.",
    images: ["https://images.unsplash.com/photo-1500534314209-a25ddb2bd429"],
    startingPrice: 8500,
    duration: "2-3 days",
    district: "Rangamati",
    attractions: ["Cloud View", "Helipad"],
    bestTimeToVisit: "October to March",
    division: "65f1a1a1a1a1a1a1a1a1a102",
    isFeatured: true,
  },
  {
    name: "Nafakhum Waterfall",
    summary: "One of the largest waterfalls in Bangladesh.",
    description:
      "Located in Bandarban, Nafakhum is a powerful waterfall and a popular trekking destination.",
    images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470"],
    startingPrice: 9000,
    duration: "3 days",
    district: "Bandarban",
    attractions: ["Waterfall", "Trekking"],
    bestTimeToVisit: "October to March",
    division: "65f1a1a1a1a1a1a1a1a1a102",
    isFeatured: false,
  },
  {
    name: "Ratargul Swamp Forest",
    summary: "Freshwater swamp forest.",
    description:
      "Ratargul is the only freshwater swamp forest in Bangladesh, offering unique boat rides.",
    images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470"],
    startingPrice: 5000,
    duration: "1-2 days",
    district: "Sylhet",
    attractions: ["Boat ride"],
    bestTimeToVisit: "June to September",
    division: "65f1a1a1a1a1a1a1a1a1a104",
    isFeatured: false,
  },
  {
    name: "Lawachara National Park",
    summary: "A tropical rainforest reserve.",
    description:
      "Lawachara is famous for its biodiversity and wildlife including hoolock gibbons.",
    images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470"],
    startingPrice: 4000,
    duration: "1 day",
    district: "Moulvibazar",
    attractions: ["Rainforest"],
    bestTimeToVisit: "October to March",
    division: "65f1a1a1a1a1a1a1a1a1a104",
    isFeatured: false,
  },
  {
    name: "Ahsan Manzil",
    summary: "Historic palace in Dhaka.",
    description:
      "Ahsan Manzil is a pink palace located in Dhaka, representing Mughal architecture.",
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
    startingPrice: 1000,
    duration: "Half day",
    district: "Dhaka",
    attractions: ["Museum"],
    bestTimeToVisit: "All year",
    division: "65f1a1a1a1a1a1a1a1a1a106",
    isFeatured: false,
  },
  {
    name: "Lalbagh Fort",
    summary: "Mughal fort complex.",
    description:
      "Lalbagh Fort is a historical Mughal fort in Dhaka with gardens and museum.",
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
    startingPrice: 1000,
    duration: "Half day",
    district: "Dhaka",
    attractions: ["Fort"],
    bestTimeToVisit: "Winter",
    division: "65f1a1a1a1a1a1a1a1a1a106",
    isFeatured: false,
  },
  {
    name: "Tanguar Haor",
    summary: "A beautiful wetland ecosystem.",
    description:
      "Tanguar Haor is known for its vast wetlands, migratory birds, and natural beauty.",
    images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470"],
    startingPrice: 7000,
    duration: "2-3 days",
    district: "Sunamganj",
    attractions: ["Boat ride"],
    bestTimeToVisit: "Monsoon",
    division: "65f1a1a1a1a1a1a1a1a1a104",
    isFeatured: false,
  },
  {
    name: "Hakaluki Haor",
    summary: "Largest wetland in Bangladesh.",
    description: "Hakaluki Haor is famous for biodiversity and migratory birds.",
    images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470"],
    startingPrice: 6000,
    duration: "2 days",
    district: "Moulvibazar",
    attractions: ["Bird watching"],
    bestTimeToVisit: "Winter",
    division: "65f1a1a1a1a1a1a1a1a1a104",
    isFeatured: false,
  },
  {
    name: "Inani Beach",
    summary: "Coral stone beach near Cox's Bazar.",
    description:
      "Inani Beach is quieter than Cox's Bazar and known for coral stones.",
    images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"],
    startingPrice: 5000,
    duration: "1-2 days",
    district: "Cox's Bazar",
    attractions: ["Coral stones"],
    bestTimeToVisit: "October to March",
    division: "65f1a1a1a1a1a1a1a1a1a102",
    isFeatured: false,
  },
  {
    name: "Himchari National Park",
    summary: "Nature reserve with hills and waterfalls.",
    description:
      "Himchari offers scenic hills, waterfalls, and forest environment near Cox's Bazar.",
    images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470"],
    startingPrice: 4000,
    duration: "1 day",
    district: "Cox's Bazar",
    attractions: ["Waterfall"],
    bestTimeToVisit: "October to March",
    division: "65f1a1a1a1a1a1a1a1a1a102",
    isFeatured: false,
  },
];

const seedDestinations = async () => {
  try {
    const dbUrl = envVars.DB_URL;

    if (!dbUrl) {
      throw new Error("DB_URL is not defined in environment variables");
    }

    console.log("Connecting to database...");
    await mongoose.connect(dbUrl);
    console.log("Connected to database.");

    const destinationNames = destinations.map((item) => item.name);

    const existingDestinationNames = await Destination.find({
      name: { $in: destinationNames },
    }).distinct("name");

    const existingDestinationNameSet = new Set(
      existingDestinationNames.map((name) => String(name)),
    );

    const operations = destinations.map((item) => ({
      updateOne: {
        filter: { name: item.name },
        update: {
          $set: {
            ...item,
            slug: slugify(item.name, { lower: true, strict: true, trim: true }),
          },
        },
        upsert: true,
      },
    }));

    const result = await Destination.bulkWrite(operations);

    const createdCount = destinations.filter(
      (item) => !existingDestinationNameSet.has(item.name),
    ).length;

    const updatedCount = destinations.length - createdCount;

    console.log("Destination seed completed successfully.");
    console.log(`Inserted: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Matched existing: ${result.matchedCount}`);
    console.log(`Modified existing: ${result.modifiedCount}`);
    console.log(`Upserted: ${result.upsertedCount}`);
  } catch (error) {
    console.error("Destination seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
};

void seedDestinations();