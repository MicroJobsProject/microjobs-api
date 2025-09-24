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
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget enim sollicitudin, laoreet sem vel, pulvinar leo. Morbi nibh elit, congue vitae tempor nec, eleifend ut ante. Nullam aliquam ligula eu est pulvinar, vel ultrices tortor tincidunt. Praesent ac blandit eros, eget scelerisque quam. Etiam nec eros pulvinar, ornare quam eget, aliquam purus. Nullam egestas scelerisque magna non scelerisque. Proin eu sem finibus, ultrices lectus id, ornare velit. Fusce nisl dui, vehicula non eleifend et, hendrerit vitae diam.",
    },
    {
      name: "Ipsum",
      owner: user._id,
      price: 9.99,
      offer: false,
      category: "electrician",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget enim sollicitudin, laoreet sem vel, pulvinar leo. Morbi nibh elit, congue vitae tempor nec, eleifend ut ante. Nullam aliquam ligula eu est pulvinar, vel ultrices tortor tincidunt. Praesent ac blandit eros, eget scelerisque quam. Etiam nec eros pulvinar, ornare quam eget, aliquam purus. Nullam egestas scelerisque magna non scelerisque. Proin eu sem finibus, ultrices lectus id, ornare velit. Fusce nisl dui, vehicula non eleifend et, hendrerit vitae diam.",
    },
    {
      name: "Dolor sit",
      owner: admin._id,
      price: 30,
      offer: true,
      category: "gardening",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget enim sollicitudin, laoreet sem vel, pulvinar leo. Morbi nibh elit, congue vitae tempor nec, eleifend ut ante. Nullam aliquam ligula eu est pulvinar, vel ultrices tortor tincidunt. Praesent ac blandit eros, eget scelerisque quam. Etiam nec eros pulvinar, ornare quam eget, aliquam purus. Nullam egestas scelerisque magna non scelerisque. Proin eu sem finibus, ultrices lectus id, ornare velit.",
    },
    {
      name: "Amet",
      owner: admin._id,
      price: 10,
      offer: false,
      category: "plumbing",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget enim sollicitudin, laoreet sem vel, pulvinar leo. Morbi nibh elit, congue vitae tempor nec, eleifend ut ante. Nullam aliquam ligula eu est pulvinar, vel ultrices tortor tincidunt. Praesent ac blandit eros, eget scelerisque quam. Etiam nec eros pulvinar, ornare quam eget, aliquam purus. Nullam egestas scelerisque magna non scelerisque.",
    },
    {
      name: "Consectetur",
      owner: user._id,
      price: 15,
      offer: false,
      category: "plumbing",
      description:
        "Duis eget enim sollicitudin, laoreet sem vel, pulvinar leo. Morbi nibh elit, congue vitae tempor nec, eleifend ut ante. Nullam aliquam ligula eu est pulvinar, vel ultrices tortor tincidunt. Praesent ac blandit eros, eget scelerisque quam. Etiam nec eros pulvinar, ornare quam eget, aliquam purus. Nullam egestas scelerisque magna non scelerisque. Proin eu sem finibus, ultrices lectus id, ornare velit. Fusce nisl dui, vehicula non eleifend et, hendrerit vitae diam.",
    },
    {
      name: "Adiscing elit",
      owner: user._id,
      price: 55,
      offer: false,
      category: "painting",
      description:
        "Morbi nibh elit, congue vitae tempor nec, eleifend ut ante. Nullam aliquam ligula eu est pulvinar, vel ultrices tortor tincidunt. Praesent ac blandit eros, eget scelerisque quam. Etiam nec eros pulvinar, ornare quam eget, aliquam purus. Nullam egestas scelerisque magna non scelerisque. Proin eu sem finibus, ultrices lectus id, ornare velit. Fusce nisl dui, vehicula non eleifend et, hendrerit vitae diam.",
    },
    {
      name: "Pellentesque",
      owner: admin._id,
      price: 40,
      offer: true,
      category: "electrician",
      description:
        "Nullam aliquam ligula eu est pulvinar, vel ultrices tortor tincidunt. Praesent ac blandit eros, eget scelerisque quam. Etiam nec eros pulvinar, ornare quam eget, aliquam purus. Nullam egestas scelerisque magna non scelerisque. Proin eu sem finibus, ultrices lectus id, ornare velit. Fusce nisl dui, vehicula non eleifend et, hendrerit vitae diam.",
    },
    {
      name: "Vestibullum",
      owner: user._id,
      price: 5,
      offer: true,
      category: "pets",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget enim sollicitudin, laoreet sem vel, pulvinar leo. Morbi nibh elit, congue vitae tempor nec, eleifend ut ante. Nullam aliquam ligula eu est pulvinar, vel ultrices tortor tincidunt. Praesent ac blandit eros, eget scelerisque quam.",
    },
    {
      name: "Curibator",
      owner: admin._id,
      price: 10,
      offer: true,
      category: "gardening",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget enim sollicitudin, laoreet sem vel, pulvinar leo.",
    },
    {
      name: "Sed dapibus",
      owner: user._id,
      price: 10,
      offer: false,
      category: "cleaning",
      description:
        "Nullam egestas scelerisque magna non scelerisque. Proin eu sem finibus, ultrices lectus id, ornare velit. Fusce nisl dui, vehicula non eleifend et, hendrerit vitae diam.",
    },
    {
      name: "Metus",
      owner: admin._id,
      price: 12,
      offer: true,
      category: "gardening",
      description:
        "Morbi nibh elit, congue vitae tempor nec, eleifend ut ante. Nullam aliquam ligula eu est pulvinar, vel ultrices tortor tincidunt. Praesent ac blandit eros, eget scelerisque quam. Etiam nec eros pulvinar, ornare quam eget, aliquam purus. Nullam egestas scelerisque magna non scelerisque.",
    },
    {
      name: "At laboris",
      owner: admin._id,
      price: 35,
      offer: false,
      category: "transport",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget enim sollicitudin, laoreet sem vel, pulvinar leo. Morbi nibh elit, congue vitae tempor nec, eleifend ut ante. Praesent ac blandit eros, eget scelerisque quam. Etiam nec eros pulvinar, ornare quam eget, aliquam purus. Nullam egestas scelerisque magna non scelerisque. Proin eu sem finibus, ultrices lectus id, ornare velit. Fusce nisl dui, vehicula non eleifend et, hendrerit vitae diam.",
    },
    {
      name: "Auctor",
      owner: user._id,
      price: 25,
      offer: true,
      category: "transport",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget enim sollicitudin, laoreet sem vel, pulvinar leo. Morbi nibh elit, congue vitae tempor nec, eleifend ut ante. Nullam aliquam ligula eu est pulvinar, vel ultrices tortor tincidunt. Praesent ac blandit eros, eget scelerisque quam. Etiam nec eros pulvinar, ornare quam eget, aliquam purus. Nullam egestas scelerisque magna non scelerisque. Proin eu sem finibus, ultrices lectus id, ornare velit. Fusce nisl dui, vehicula non eleifend et, hendrerit vitae diam.",
    },
    {
      name: "Mauris imperdiet lacus",
      owner: user._id,
      price: 7,
      offer: true,
      category: "private classes",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nisl dui, vehicula non eleifend et, hendrerit vitae diam.",
    },
    {
      name: "Sapien turpis congue nunc",
      owner: admin._id,
      price: 30,
      offer: true,
      category: "painting",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget enim sollicitudin, laoreet sem vel, pulvinar leo. Morbi nibh elit, congue vitae tempor nec, eleifend ut ante. Nullam aliquam ligula eu est pulvinar, vel ultrices tortor tincidunt.",
    },
    {
      name: "Nisl ut porttitor bibendum eros",
      owner: admin._id,
      price: 8,
      offer: false,
      category: "technology",
      description:
        "Praesent ac blandit eros, eget scelerisque quam. Etiam nec eros pulvinar, ornare quam eget, aliquam purus. Nullam egestas scelerisque magna non scelerisque. Proin eu sem finibus, ultrices lectus id, ornare velit. Fusce nisl dui, vehicula non eleifend et, hendrerit vitae diam.",
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
