//DEPENDENCIES
import "dotenv/config";
import process from "node:process";
import readline from "node:readline/promises";

//NATIVE
import connectMongoose from "./lib/connectMongoose.js";
import User from "./models/User.js";
import Advert from "./models/Advert.js";

const connection = await connectMongoose();
console.log(`Connected to MongoDB: ${connection.name}`);

const answer = await question("Delete current database collection? [y/N] ");

if (answer.toLowerCase() !== "y") {
  console.log("Operation cancelled");
  process.exit();
}

await initUsers();
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
      username: "admin",
      email: "admin@example.com",
      password: "123456",
    }),
    new User({
      username: "user",
      email: "user@example.com",
      password: "123456",
    }),
  ];

  const insertResult = await User.bulkSave(users);
  console.log(`+ INSERTED ${insertResult.length} users`);
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
  const [admin, user] = await Promise.all([
    User.findOne({ email: "admin@example.com" }),
    User.findOne({ email: "user@example.com" }),
  ]);

  const insertResult = await Advert.insertMany([
    {
      name: "Lorem",
      owner: admin._id,
      price: 0,
      offer: true,
      category: "plumbing",
    },
    {
      name: "Ipsum",
      owner: user._id,
      price: 9.99,
      offer: false,
      category: "electrician",
    },
    {
      name: "Dolor sit",
      owner: admin._id,
      price: 30,
      offer: true,
      category: "gardening",
    },
    {
      name: "Amet",
      owner: admin._id,
      price: 10,
      offer: false,
      category: "plumbing",
    },
    {
      name: "Consectetur",
      owner: user._id,
      price: 15,
      offer: false,
      category: "plumbing",
    },
    {
      name: "Adiscing elit",
      owner: user._id,
      price: 55,
      offer: false,
      category: "painting",
    },
    {
      name: "Pellentesque",
      owner: admin._id,
      price: 40,
      offer: true,
      category: "electrician",
    },
    {
      name: "Vestibullum",
      owner: user._id,
      price: 5,
      offer: true,
      category: "pets",
    },
    {
      name: "Curibator",
      owner: admin._id,
      price: 10,
      offer: true,
      category: "gardening",
    },
    {
      name: "Sed dapibus",
      owner: user._id,
      price: 10,
      offer: false,
      category: "cleaning",
    },
    {
      name: "Metus",
      owner: admin._id,
      price: 12,
      offer: true,
      category: "gardening",
    },
    {
      name: "At laboris",
      owner: admin._id,
      price: 35,
      offer: false,
      category: "transport",
    },
    {
      name: "Auctor",
      owner: user._id,
      price: 25,
      offer: true,
      category: "transport",
    },
    {
      name: "Mauris imperdiet lacus",
      owner: user._id,
      price: 7,
      offer: true,
      category: "private classes",
    },
    {
      name: "Sapien turpis congue nunc",
      owner: admin._id,
      price: 30,
      offer: true,
      category: "painting",
    },
    {
      name: "Nisl ut porttitor bibendum eros",
      owner: admin._id,
      price: 8,
      offer: false,
      category: "technology",
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
