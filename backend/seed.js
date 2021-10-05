require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");

if (!process.env.MONGODB_URI) {
  console.warn("Missing MONGODB_URI in env, please add it to your .env file");
}

mongoose.connect(process.env.MONGODB_URI);

require("./models/User");
require("./models/Item");
require("./models/Comment");

const Item = mongoose.model("Item");
const Comment = mongoose.model("Comment");
const User = mongoose.model("User");

async function createItem(user, itemData) {
  const item = new Item(itemData);
  item.seller = user;
  return item.save();
}

async function createComment(user, item, commentData) {
  const comment = new Comment(commentData);
  comment.item = item;
  comment.seller = user;
  await comment.save();
  item.comments = item.comments.concat([comment]);
  await item.save();
  return comment;
}

async function createUser(username, email, password) {
  const user = new User();

  user.username = username;
  user.email = email;
  user.setPassword(password);

  await user.save();

  const items = Math.floor(Math.random() * 4);
  for (let i = 0; i < items; i++) {
    const date = Date.now();
    const rand = Math.floor(Math.random() * 1000);
    const item = await createItem(user, {
      slug: `item-${date}-${rand}-${i}`,
      title: `Item ${date} ${rand} ${i}`,
    });
    const comments = Math.floor(Math.random() * 4);
    for (let j = 0; j < comments; j++) {
      await createComment(user, item, {
        body: `User ${user.username} has commented ${Math.floor(Math.random() * 10000)} on ${item.title}.`
      });
    }
  }
}

async function seed() {
  await User.remove({});
  await Item.remove({});
  await Comment.remove({});
  for (let i = 0; i < 101; i++) {
    await createUser(`testUser${i}`, `test+${i}@example.com`, `Ab${i}${i}zzZZ`);
  }
  await mongoose.connection.close();
}

seed();
