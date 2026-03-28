import bcryptjs from "bcryptjs";
import { User } from "../app/modules/user/user.model";
import { IsActive, Role } from "../app/modules/user/user.interface";

// ================== 👨 MALE FIRST NAMES (130) ==================
const maleFirstNames = [
"Rahim","Karim","Sakib","Tamim","Mahmud","Hasan","Nayeem","Fahim","Jahid","Rakib",
"Shanto","Imran","Arif","Mehedi","Rafi","Tariq","Shahin","Nasim","Rashid","Jubayer",
"Asif","Sabbir","Tanvir","Saiful","Mizan","Biplob","Rony","Parvez","Emon","Zahid",
"Shuvo","Amin","Noman","Rasel","Sohel","Kamal","Rifat","Jisan","Adnan","Farhan",
"Ashik","Siam","Labib","Omar","Hridoy","Shariar","Minhaz","Arafat","Munna","Sumon",
"Foysal","Rakibul","Shamim","Shakil","Zubair","Arman","Nahid","Sohan","Fardin","Tushar",
"Riyad","Sajid","Mahfuz","Ehsan","Ashraf","Shams","Helal","Delwar","Bashir","Kabir",
"Azhar","Yasin","Morshed","Rashed","Jalal","Shafayet","Saad","Ayaan","Rakin","Nabil",
"Rakinul","Masud","Naeem","Faruq","Badiul","Shawon","Sadiq","Touhid","Riyaz","Sharif",
"Zayan","Mahin","Sifat","Tahmid","Raihan","Nihad","Ragib","Arefin","Saklain","Sakil",
"Rabby","Tareq","Mahdi","Abrar","Rafsan","Fahad","Adil","Rumman","Sayeed","Saif",
"Zeeshan","Tanay","Aftab","Ronyel","Mahir","Razin","Shadman","Nishat","Shahriar","Fahimul"
];

// ================== 👩 FEMALE FIRST NAMES (70) ==================
const femaleFirstNames = [
"Ayesha","Fatema","Nusrat","Sumaiya","Jannat","Mim","Tania","Rima","Sadia","Priya",
"Nabila","Tasnim","Sharmin","Lamia","Maliha","Rashida","Farzana","Taslima","Sultana",
"Mehjabin","Israt","Anika","Afia","Bushra","Roksana","Salma","Nahar","Mitu","Trisha",
"Fariha","Tanjina","Nafisa","Raisa","Rumana","Liza","Mousumi","Sumi","Amina","Sabina",
"Sharmeen","Tahmina","Rukhsana","Samira","Dilruba","Shahnaz","Fahmida","Kaniz","Nasrin",
"Jhuma","Rubi","Shila","Pinky","Brishti","Orpa","Oishee","Tithi","Nova","Rupa",
"Sanjida","Lubna","Zannat","Mahi","Saba","Ifra","Rafiya","Tabassum","Faria","Anjum"
];

// ================== 👤 LAST NAMES (130) ==================
const lastNames = [
"Ahmed","Hossain","Islam","Rahman","Chowdhury","Khan","Mia","Uddin","Talukder","Sarker",
"Biswas","Das","Roy","Dewan","Majumder","Bepari","Mondal","Gazi","Hawlader","Sikder",
"Pathan","Mirza","Khandaker","Bhuiyan","Barua","Chakraborty","Paul","Saha","Debnath",
"Gupta","Nath","Sen","Datta","Barman","Karmakar","Mollah","Prodhan","Sheikh","Malik",
"Sharif","Kabir","Azad","Jamal","Iqbal","Latif","Habib","Yusuf","Salam","Bashar",
"Rashid","Akter","Mahmud","Faruq","Rafiq","Siddique","Karim","Rahim","Haque","Huq",
"Aziz","Sattar","Jabbar","Mannan","Rabbani","Rony","Sohan","Rasel","Biplob","Tariq",
"Zaman","Kawsar","Nayeem","Arman","Fahim","Sabbir","Tanvir","Saiful","Hasib","Adnan",
"Rakib","Emon","Shuvo","Sohel","Amin","Noman","Rifat","Farhan","Siam","Labib",
"Omar","Hridoy","Minhaz","Arafat","Sumon","Shakil","Zubair","Nahid","Sohan","Fardin",
"Tushar","Riyad","Sajid","Mahfuz","Ehsan","Ashraf","Shams","Helal","Delwar","Bashir",
"Kabir","Azhar","Yasin","Morshed","Rashed","Jalal","Saad","Ayaan","Nabil","Masud"
];

// ================== 📍 64 DISTRICTS ==================
const districts = [
"Bagerhat","Bandarban","Barguna","Barishal","Bhola","Bogura","Brahmanbaria","Chandpur",
"Chattogram","Chuadanga","CoxsBazar","Cumilla","Dhaka","Dinajpur","Faridpur","Feni",
"Gaibandha","Gazipur","Gopalganj","Habiganj","Jamalpur","Jashore","Jhalokathi","Jhenaidah",
"Joypurhat","Khagrachari","Khulna","Kishoreganj","Kurigram","Kushtia","Lakshmipur","Lalmonirhat",
"Madaripur","Magura","Manikganj","Meherpur","Moulvibazar","Munshiganj","Mymensingh","Naogaon",
"Narail","Narayanganj","Narsingdi","Natore","Netrokona","Nilphamari","Noakhali","Pabna",
"Panchagarh","Patuakhali","Pirojpur","Rajbari","Rajshahi","Rangamati","Rangpur","Satkhira",
"Shariatpur","Sherpur","Sirajganj","Sunamganj","Sylhet","Tangail","Thakurgaon"
];

// ================== HELPER ==================
const getRandom = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

// ================== SEED FUNCTION ==================
const seedUsers = async () => {
  const users = [];

  const hashedPassword = await bcryptjs.hash("SH@nto315", 10);

  for (let i = 0; i < 1000; i++) {
    // ✅ gender based on name source (NOT random later)
    const isMale = i % 2 === 0; // balanced dataset

    const firstName = isMale
      ? getRandom(maleFirstNames)
      : getRandom(femaleFirstNames);

    const lastName = getRandom(lastNames);

    const name = `${firstName} ${lastName}`;

    const email = `${firstName}.${lastName}${i}@gmail.com`.toLowerCase();

    const gender = isMale ? "men" : "women";
    const imageIndex = i % 99;
    const picture = `https://randomuser.me/api/portraits/${gender}/${imageIndex}.jpg`;

    users.push({
      name,
      email,
      password: hashedPassword,
      phone: `01${Math.floor(300000000 + Math.random() * 699999999)}`,
      address: getRandom(districts),
      picture,
      isVerified: Math.random() > 0.15,
      isActive: IsActive.ACTIVE,
      role: Role.USER,
      auths: [
        {
          provider: "credentials",
          providerId: email,
        },
      ],
    });
  }

  await User.insertMany(users, { ordered: false });

  console.log("✅ 1000 PERFECT BD users seeded");
};

export default seedUsers;