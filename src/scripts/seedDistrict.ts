import { District } from "../app/modules/district/district.model";

const DIVISIONS = {
  DHAKA:      "68794d2c72921a8fa761d7bc",
  KHULNA:     "6879e98c994dac1c2e99aa61",
  RAJSHAHI:   "6879eb0a884432b395a9be3f",
  SYLHET:     "6879f4790ac9886851077625",
  RANGPUR:    "687b3c8fe10223e2890d2f99",
  MYMENSINGH: "687b3caae10223e2890d2f9e",
  BARISHAL:   "68ee46292f2d4a572e100a6d",
  CHATTOGRAM: "690f2055fd598094defb054d",
};

const districtData = [
  // BARISHAL (6)
  { name: "Barguna",           slug: "barguna",           division: DIVISIONS.BARISHAL },
  { name: "Barishal",          slug: "barishal",          division: DIVISIONS.BARISHAL },
  { name: "Bhola",             slug: "bhola",             division: DIVISIONS.BARISHAL },
  { name: "Jhalokati",         slug: "jhalokati",         division: DIVISIONS.BARISHAL },
  { name: "Patuakhali",        slug: "patuakhali",        division: DIVISIONS.BARISHAL },
  { name: "Pirojpur",          slug: "pirojpur",          division: DIVISIONS.BARISHAL },

  // CHATTOGRAM (11)
  { name: "Bandarban",         slug: "bandarban",         division: DIVISIONS.CHATTOGRAM },
  { name: "Brahmanbaria",      slug: "brahmanbaria",      division: DIVISIONS.CHATTOGRAM },
  { name: "Chandpur",          slug: "chandpur",          division: DIVISIONS.CHATTOGRAM },
  { name: "Chattogram",        slug: "chattogram",        division: DIVISIONS.CHATTOGRAM },
  { name: "Comilla",           slug: "comilla",           division: DIVISIONS.CHATTOGRAM },
  { name: "Cox's Bazar",       slug: "coxs-bazar",        division: DIVISIONS.CHATTOGRAM },
  { name: "Feni",              slug: "feni",              division: DIVISIONS.CHATTOGRAM },
  { name: "Khagrachhari",      slug: "khagrachhari",      division: DIVISIONS.CHATTOGRAM },
  { name: "Lakshmipur",        slug: "lakshmipur",        division: DIVISIONS.CHATTOGRAM },
  { name: "Noakhali",          slug: "noakhali",          division: DIVISIONS.CHATTOGRAM },
  { name: "Rangamati",         slug: "rangamati",         division: DIVISIONS.CHATTOGRAM },

  // DHAKA (13)
  { name: "Dhaka",             slug: "dhaka",             division: DIVISIONS.DHAKA },
  { name: "Faridpur",          slug: "faridpur",          division: DIVISIONS.DHAKA },
  { name: "Gazipur",           slug: "gazipur",           division: DIVISIONS.DHAKA },
  { name: "Gopalganj",         slug: "gopalganj",         division: DIVISIONS.DHAKA },
  { name: "Kishoreganj",       slug: "kishoreganj",       division: DIVISIONS.DHAKA },
  { name: "Madaripur",         slug: "madaripur",         division: DIVISIONS.DHAKA },
  { name: "Manikganj",         slug: "manikganj",         division: DIVISIONS.DHAKA },
  { name: "Munshiganj",        slug: "munshiganj",        division: DIVISIONS.DHAKA },
  { name: "Narayanganj",       slug: "narayanganj",       division: DIVISIONS.DHAKA },
  { name: "Narsingdi",         slug: "narsingdi",         division: DIVISIONS.DHAKA },
  { name: "Rajbari",           slug: "rajbari",           division: DIVISIONS.DHAKA },
  { name: "Shariatpur",        slug: "shariatpur",        division: DIVISIONS.DHAKA },
  { name: "Tangail",           slug: "tangail",           division: DIVISIONS.DHAKA },

  // KHULNA (10)
  { name: "Bagerhat",          slug: "bagerhat",          division: DIVISIONS.KHULNA },
  { name: "Chuadanga",         slug: "chuadanga",         division: DIVISIONS.KHULNA },
  { name: "Jashore",           slug: "jashore",           division: DIVISIONS.KHULNA },
  { name: "Jhenaidah",         slug: "jhenaidah",         division: DIVISIONS.KHULNA },
  { name: "Khulna",            slug: "khulna",            division: DIVISIONS.KHULNA },
  { name: "Kushtia",           slug: "kushtia",           division: DIVISIONS.KHULNA },
  { name: "Magura",            slug: "magura",            division: DIVISIONS.KHULNA },
  { name: "Meherpur",          slug: "meherpur",          division: DIVISIONS.KHULNA },
  { name: "Narail",            slug: "narail",            division: DIVISIONS.KHULNA },
  { name: "Satkhira",          slug: "satkhira",          division: DIVISIONS.KHULNA },

  // MYMENSINGH (4)
  { name: "Jamalpur",          slug: "jamalpur",          division: DIVISIONS.MYMENSINGH },
  { name: "Mymensingh",        slug: "mymensingh",        division: DIVISIONS.MYMENSINGH },
  { name: "Netrokona",         slug: "netrokona",         division: DIVISIONS.MYMENSINGH },
  { name: "Sherpur",           slug: "sherpur",           division: DIVISIONS.MYMENSINGH },

  // RAJSHAHI (8)
  { name: "Bogura",            slug: "bogura",            division: DIVISIONS.RAJSHAHI },
  { name: "Chapainawabganj",   slug: "chapainawabganj",   division: DIVISIONS.RAJSHAHI },
  { name: "Joypurhat",         slug: "joypurhat",         division: DIVISIONS.RAJSHAHI },
  { name: "Naogaon",           slug: "naogaon",           division: DIVISIONS.RAJSHAHI },
  { name: "Natore",            slug: "natore",            division: DIVISIONS.RAJSHAHI },
  { name: "Pabna",             slug: "pabna",             division: DIVISIONS.RAJSHAHI },
  { name: "Rajshahi",          slug: "rajshahi",          division: DIVISIONS.RAJSHAHI },
  { name: "Sirajganj",         slug: "sirajganj",         division: DIVISIONS.RAJSHAHI },

  // RANGPUR (8)
  { name: "Dinajpur",          slug: "dinajpur",          division: DIVISIONS.RANGPUR },
  { name: "Gaibandha",         slug: "gaibandha",         division: DIVISIONS.RANGPUR },
  { name: "Kurigram",          slug: "kurigram",          division: DIVISIONS.RANGPUR },
  { name: "Lalmonirhat",       slug: "lalmonirhat",       division: DIVISIONS.RANGPUR },
  { name: "Nilphamari",        slug: "nilphamari",        division: DIVISIONS.RANGPUR },
  { name: "Panchagarh",        slug: "panchagarh",        division: DIVISIONS.RANGPUR },
  { name: "Rangpur",           slug: "rangpur",           division: DIVISIONS.RANGPUR },
  { name: "Thakurgaon",        slug: "thakurgaon",        division: DIVISIONS.RANGPUR },

  // SYLHET (4)
  { name: "Habiganj",          slug: "habiganj",          division: DIVISIONS.SYLHET },
  { name: "Moulvibazar",       slug: "moulvibazar",       division: DIVISIONS.SYLHET },
  { name: "Sunamganj",         slug: "sunamganj",         division: DIVISIONS.SYLHET },
  { name: "Sylhet",            slug: "sylhet",            division: DIVISIONS.SYLHET },
];

export const seedDistricts = async () => {
  const existing = await District.countDocuments();
  if (existing > 0) {
    console.log("Districts already seeded, skipping.");
    return;
  }

  await District.insertMany(districtData);
  console.log(`Seeded ${districtData.length} districts successfully.`);
};