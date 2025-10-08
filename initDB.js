//DEPENDENCIES
import "dotenv/config";
import process from "node:process";
import readline from "node:readline/promises";

//NATIVE
import connectMongoose from "./lib/connectMongoose.js";
import User from "./models/User.js";
import Advert from "./models/Advert.js";
import Category from "./models/Category.js";

const connection = await connectMongoose();
console.log(`Connected to MongoDB: ${connection.name}`);

const answer = await question("Delete current database collection? [y/N] ");

if (answer.toLowerCase() !== "y") {
  console.log("Operation cancelled");
  process.exit();
}

await initUsers();
await initCategories();
await initAdverts();
await connection.close();

async function initUsers() {
  /**
   * DELETE ALL USERS
   */
  const deleteResult = await User.deleteMany();
  console.log(`\n- DELETED ${deleteResult.deletedCount} users`);

  /**
   * CREATE USERS (bulkSave for hash password pre middleware)
   */
  const users = [
    new User({
      username: "Admin",
      email: "admin@example.com",
      password: "123456",
    }),
    new User({
      username: "User",
      email: "user@example.com",
      password: "123456",
    }),
    new User({
      username: "Alice",
      email: "alice@example.com",
      password: "123456",
    }),
    new User({ username: "Bob", email: "bob@example.com", password: "123456" }),
    new User({
      username: "Carol",
      email: "carol@example.com",
      password: "123456",
    }),
  ];

  const insertResult = await User.bulkSave(users);
  console.log(`+ INSERTED ${insertResult.insertedCount} users`);
}

async function initCategories() {
  /**
   * DELETE ALL CATEGORIES
   */
  const deleteResult = await Category.deleteMany();
  console.log(`- DELETED ${deleteResult.deletedCount} categories`);

  /**
   * CREATE CATEGORIES
   */
  const insertResult = await Category.insertMany([
    { name: "Caring", icon: "eye_tracking" },
    { name: "Cleaning", icon: "cleaning" },
    { name: "Electrician", icon: "electric_bolt" },
    { name: "Gardening", icon: "local_florist" },
    { name: "Painting", icon: "format_paint" },
    { name: "Personal Training", icon: "fitness_center" },
    { name: "Pets", icon: "pets" },
    { name: "Plumbing", icon: "plumbing" },
    { name: "Private Classes", icon: "school" },
    { name: "Technology", icon: "devices" },
    { name: "Transport", icon: "local_shipping" },
    { name: "Video & Photography", icon: "videocam" },
  ]);
  console.log(`+ INSERTED ${insertResult.length} categories`);
}

async function initAdverts() {
  /**
   * DELETE ALL ADVERTS
   */
  const deleteResult = await Advert.deleteMany();
  console.log(`- DELETED ${deleteResult.deletedCount} adverts`);

  /**
   * CREATE ADVERTS
   */
  const [admin, user, alice, bob, carol] = await Promise.all([
    User.findOne({ email: "admin@example.com" }),
    User.findOne({ email: "user@example.com" }),
    User.findOne({ email: "alice@example.com" }),
    User.findOne({ email: "bob@example.com" }),
    User.findOne({ email: "carol@example.com" }),
  ]);

  const insertResult = await Advert.insertMany([
    {
      name: "Plumbing repair for small leaks",
      owner: admin._id,
      price: 25,
      offer: true,
      category: "Plumbing",
      description:
        "Quick and affordable plumbing service for small leaks, dripping taps, and minor bathroom issues. I provide same-day visits in most areas and always clean up after finishing the job. If you are struggling with water pressure or need to replace a tap, don't hesitate to contact me. Over five years of experience with guaranteed satisfaction and transparent pricing.",
      photo: "/uploads/1759838101001-plumbing-leak.jpg",
    },
    {
      name: "Professional home cleaning",
      owner: alice._id,
      price: 40,
      offer: true,
      category: "Cleaning",
      description:
        "Reliable house cleaning with eco-friendly products. Weekly or one-time jobs available. My service includes dusting, mopping, and kitchen and bathroom cleaning. I also offer laundry and ironing upon request. I bring all cleaning materials with me, so you can relax and return to a spotless home.",
      photo: "/uploads/1759838101022-home-cleaning.jpg",
    },
    {
      name: "Electrician for light installations",
      owner: bob._id,
      price: 60,
      offer: true,
      category: "Electrician",
      description:
        "Certified electrician available for lighting, outlets, and small electrical repairs. I can replace old fixtures, add new switches, or troubleshoot power issues in your home. My work is neat and compliant with local safety standards. Emergency calls available on weekends.",
      photo: "/uploads/1759838101039-electrician-installation.jpg",
    },
    {
      name: "Pet walking in my neighborhood",
      owner: user._id,
      price: 10,
      offer: false,
      category: "Pets",
      description:
        "I used to walk my dog Barnabas, then I took an arrow in the knee and can no longer do that. I live 10 minutes away from a park with a dog area. It would be great if you could spend at least 30 minutes outside with him, playing with him, keeping an eye on him, making sure he stays hydrated and gets some exercise. He is very friendly and usually calm.",
    },
    {
      name: "Private English classes for beginners",
      owner: carol._id,
      price: 20,
      offer: true,
      category: "Private Classes",
      description:
        "Improve your English level quickly with personal tutoring sessions. Lessons are customized based on your goals—grammar, pronunciation, or conversation practice. I have over 3 years of teaching experience with students from various backgrounds. Online or in-person classes available.",
      photo: "/uploads/1759838101057-private-english.jpg",
    },
    {
      name: "Local moving service with van",
      owner: admin._id,
      price: 80,
      offer: false,
      category: "Transport",
      description:
        "I am moving and need a van to transport my belongings. I don't have much furniture and no appliances; most of my belongings will be personal boxes. I can provide protective blankets, as I have some delicate items, so I would prefer someone who takes safety measures to secure your items or who drives very carefully.\n\nI'm very busy at work, so I can only respond to messages on weekends. It is essential that you are punctual if we agree on a date and time.",
      photo: "/uploads/1759838101078-local-moving.jpg",
    },
    {
      name: "Garden maintenance and plant care",
      owner: alice._id,
      price: 30,
      offer: true,
      category: "Gardening",
      description:
        "Keep your garden green and clean with monthly maintenance service. I take care of mowing, trimming, watering, and general plant health. I also offer advice on soil improvement and seasonal planting to make your outdoor space beautiful all year long.",
    },
    {
      name: "Computer setup and optimization",
      owner: user._id,
      price: 35,
      offer: true,
      category: "Technology",
      description:
        "PC setup, antivirus installation, and performance optimization. If your computer runs slowly, I can help with software cleanup, driver updates, and basic hardware checks. Ideal for home offices or personal laptops needing a fresh start.",
      photo: "/uploads/1759838101112-computer-setup.jpg",
    },
    {
      name: "Baby care and babysitting evenings",
      owner: carol._id,
      price: 12,
      offer: false,
      category: "Caring",
      description:
        "Responsible babysitting for evenings and weekends. Creative activities, bedtime routines,and calm environment are valued. Must have experience with toddlers and school-aged kids. Please send your references in case you're interested.",
    },
    {
      name: "Furniture painting and restoration",
      owner: admin._id,
      price: 70,
      offer: true,
      category: "Painting",
      description:
        "Give your old furniture a new life with custom painting and finish.\n\nI specialize in restoring wooden chairs, tables, and cabinets using high-quality paints. Each project includes surface preparation, sanding, and varnish protection for long-lasting results.",
      photo: "/uploads/1759838101130-furniture-painting.jpg",
    },
    {
      name: "Fitness training at home",
      owner: bob._id,
      price: 25,
      offer: false,
      category: "Personal Training",
      description:
        "Personal trainer with experience in strength, flexibility, and mobility exercises. I adapt workouts and can bring basic equipment if needed, but I am only available after 6:00 PM on weekdays. I would prefer progress tracking and nutritional advice to help me achieve my goals effectively.",
    },
    {
      name: "Pet grooming and nail trimming",
      owner: user._id,
      price: 15,
      offer: false,
      category: "Pets",
      description:
        "I need a professional for small and medium-sized pets. I have two dogs, a Chihuahua and a Labrador. Services should include washing, brushing, nail trimming, and ear cleaning. A calm and spacious environment is guaranteed.\n\nPrevious experience is a minimum requirement to avoid stressing my animals.",
      photo: "/uploads/1759838101147-pet-grooming.jpg",
    },
    {
      name: "Website development for small business",
      owner: alice._id,
      price: 250,
      offer: true,
      category: "Technology",
      description:
        "Modern, responsive websites with SEO setup and analytics tracking. I work with small businesses, freelancers, and startups. Every site includes mobile optimization, contact forms, and Google integration. Fast turnaround and ongoing maintenance options available.",
      photo: "/uploads/1759838101163-web-development.jpg",
    },
    {
      name: "Flower bed planting and trimming",
      owner: carol._id,
      price: 22,
      offer: false,
      category: "Gardening",
      description:
        "Spring and autumn planting, soil preparation, and seasonal trimming. I provide tools, fertilizers, and advice for keeping your plants healthy. Affordable packages for regular maintenance visits.",
    },
    {
      name: "Air conditioner installation",
      owner: admin._id,
      price: 120,
      offer: false,
      category: "Electrician",
      description:
        "I need a professional installation for my air conditioning units. I need it before summer starts.",
      photo: "/uploads/1759838101181-air-conditioning.jpg",
    },
    {
      name: "Photography for family events",
      owner: alice._id,
      price: 150,
      offer: true,
      category: "Video & Photography",
      description:
        "High-quality event and family photography with natural light. I capture candid and posed shots for birthdays, baptisms, and small weddings. Edited photos are delivered digitally within 48 hours. Prints available upon request.",
      photo: "/uploads/1759838101199-family-photography.jpg",
    },
    {
      name: "Elderly home care assistance",
      owner: bob._id,
      price: 18,
      offer: false,
      category: "Caring",
      description:
        "Daily visits, medication reminders, and companionship for my parents. I need someone for light cooking, errands, and personal hygiene support. Compassionate and reliable care focused on dignity and comfort is a must for me.",
    },
    {
      name: "Personal driving for errands",
      owner: user._id,
      price: 40,
      offer: true,
      category: "Transport",
      description:
        "Safe and punctual transportation service for appointments or short trips. The vehicle is insured and comfortable. Ideal for seniors or those who prefer not to drive. Hourly and daily rates available.\n\nI am available every day except weekends.",
    },
    {
      name: "Bathroom plumbing installation",
      owner: carol._id,
      price: 30,
      offer: false,
      category: "Plumbing",
      description:
        "The sink in our bathroom has a very old faucet and for some reason it is difficult to get water to come out. We need the pipe to be checked for leaks, and while you're at it, install a new faucet that we bought on Amazon. The price is non-negotiable.",
      photo: "/uploads/1759838101217-bathroom-plumbing.jpg",
    },
    {
      name: "After-party home cleaning",
      owner: admin._id,
      price: 55,
      offer: true,
      category: "Cleaning",
      description:
        "Deep cleaning for kitchens, living rooms and bathrooms after events. Includes trash removal, floor mopping, and surface disinfecting. Fast turnaround to restore your home the next morning. I bring all cleaning supplies.",
      photo: "/uploads/1759838101234-party-cleaning.jpg",
    },
    {
      name: "Math tutoring for high school",
      owner: alice._id,
      price: 25,
      offer: true,
      category: "Private Classes",
      description:
        "One-on-one math tutoring sessions with practical exercises. I help students improve grades, understand algebra and geometry concepts, and prepare for exams. Flexible scheduling during afternoons or weekends.",
    },
    {
      name: "Video editing for my cooking channel",
      owner: bob._id,
      price: 100,
      offer: false,
      category: "Video & Photography",
      description:
        "I want to be a content creator on YouTube, but I have no idea how to edit videos to add cool effects. I had thought about a cooking channel. I have the equipment to record myself, but I need someone to help me make cool edits.\n\nIf you are interested, please send me some examples of your work so I can evaluate it. Thank you!",
      photo: "/uploads/1759838101251-video-editing.jpg",
    },
    {
      name: "Home office cable management",
      owner: user._id,
      price: 30,
      offer: false,
      category: "Electrician",
      description:
        "My father wants to organize and hide the messy cables to create a clean workspace in his office. There is a lot of antique furniture in the room, so we want people who are very careful and cause as little damage as possible.",
    },
    {
      name: "Interior wall painting service",
      owner: carol._id,
      price: 85,
      offer: false,
      category: "Painting",
      description:
        "I need advice on cleaning walls and quick painting, and color recommendations are also appreciated. I want to paint my son's room before he starts school, so I would like odorless paint to be used and the furniture to be protected during the process. Please use long-lasting paint; I will not accept cheap paint.",
      photo: "/uploads/1759838101269-wall-painting.jpg",
    },
    {
      name: "Laptop hardware upgrade",
      owner: admin._id,
      price: 70,
      offer: true,
      category: "Technology",
      description:
        "RAM, SSD, and fan replacements for laptops and desktops. I can also clean internal components and reinstall your operating system for better performance. Quick turnaround and data safety guaranteed.",
      photo: "/uploads/1759838101287-laptop-upgrade.jpg",
    },
    {
      name: "Dog training for basic commands",
      owner: bob._id,
      price: 25,
      offer: true,
      category: "Pets",
      description:
        "Positive reinforcement-based training for puppies and adult dogs. I teach essential commands such as sit, stay, and recall. Patience and consistency are key — results guaranteed with dedication.",
    },
    {
      name: "Car transport for long distances",
      owner: user._id,
      price: 180,
      offer: false,
      category: "Transport",
      description:
        "We need a secure vehicle transport service between provinces. It must include insurance coverage and be available to provide tracking updates. Ideally, it should be available throughout April, because we want to move to from Albacete to Guadalajara and have many items to transport.",
    },
    {
      name: "Outdoor photography workshop",
      owner: carol._id,
      price: 60,
      offer: false,
      category: "Video & Photography",
      description:
        "I want to learn the basics of composition, aperture, and natural light photography. Would appreciate someone with experience teaching beginners with DSLR or mirrorless cameras. I'm open to group and individual sessions during weekends in local parks.",
    },
    {
      name: "Window cleaning for offices",
      owner: alice._id,
      price: 45,
      offer: true,
      category: "Cleaning",
      description:
        "Streak-free window and glass cleaning for small offices and commercial spaces. I use professional-grade tools and solutions to leave your glass spotless. Service available early mornings or late evenings to avoid business interruptions.",
      photo: "/uploads/1759838101323-window-cleaning.jpg",
    },
  ]);
  console.log(`+ INSERTED ${insertResult.length} adverts`);
}

async function question(prompt) {
  const ifc = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const result = await ifc.question(prompt);

  ifc.close();

  return result;
}
