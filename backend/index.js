// server.js
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { auth } = require("express-oauth2-jwt-bearer");

const app = express();
const port = 4000;


const MONGO_URI = "mongodb+srv://Kirisi:1234@cluster0.irm3ibr.mongodb.net/ecommerce";
const JWT_SECRET = "replace_with_a_long_random_secret";
const AUTH0_DOMAIN = "YOUR_AUTH0_DOMAIN";
const AUTH0_AUDIENCE = "YOUR_AUTH0_API_AUDIENCE";

// ---------------- MIDDLEWARE ----------------
app.use(express.json());
app.use(cors());
app.use('/images', express.static('upload/images'));

// ---------------- AUTH0 MIDDLEWARE ----------------
const checkJwt = auth({
  audience: AUTH0_AUDIENCE,
  issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});

// ---------------- MONGODB CONNECTION ----------------
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// ---------------- MULTER IMAGE UPLOAD ----------------
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// ---------------- MODELS ----------------
const Product = mongoose.model("Product", {
  id: Number,
  name: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true }
});

const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  cartData: Object,
  date: { type: Date, default: Date.now }
});

// ---------------- AUTH MIDDLEWARE ----------------
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).json({ errors: "No token, authorization denied" });

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (err) {
    return res.status(401).json({ errors: "Invalid or expired token" });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user || user.role !== "admin") return res.status(403).json({ errors: "Admin access required" });
    next();
  } catch (err) {
    res.status(500).json({ errors: "Server error" });
  }
};

// ---------------- ROUTES ----------------
app.get("/", (req, res) => res.send("Express App Running"));

// Upload image
app.post("/upload", fetchUser, requireAdmin, upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  });
});

// Add product (admin only)
app.post('/addproduct', fetchUser, requireAdmin, async (req, res) => {
  let products = await Product.find({});
  let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

  const product = new Product({
    id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price
  });

  await product.save();
  res.json({ success: true, name: req.body.name });
});

// Delete product (admin only)
app.post('/removeproduct', fetchUser, requireAdmin, async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true, name: req.body.name });
});

// Get all products
app.get('/allproducts', async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// User signup
app.post('/signup', async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) return res.status(400).json({ success: false, errors: "User already exists" });

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  let cart = {}; for (let i = 0; i < 300; i++) cart[i] = 0;

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    cartData: cart,
    role: "user"
  });

  await user.save();
  const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: '15m' });
  res.json({ success: true, token });
});

// User login
app.post('/login', async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ success: false, errors: "Invalid email or password" });

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).json({ success: false, errors: "Invalid email or password" });

  const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: '15m' });
  res.json({ success: true, token });
});

// Cart endpoints
app.post('/addtocart', fetchUser, async (req, res) => {
  const userData = await Users.findById(req.user.id);
  userData.cartData[req.body.itemId] += 1;
  await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
  res.send("Added");
});

app.post('/removefromcart', fetchUser, async (req, res) => {
  const userData = await Users.findById(req.user.id);
  if (userData.cartData[req.body.itemId] > 0) userData.cartData[req.body.itemId] -= 1;
  await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
  res.send("Removed");
});

app.post('/getcart', fetchUser, async (req, res) => {
  const userData = await Users.findById(req.user.id);
  res.json(userData.cartData);
});

// ---------------- NEW COLLECTIONS ----------------
app.get('/newcollections', async (req, res) => {
  const products = await Product.find({});
  const newCollection = products.slice(-8);
  res.json(newCollection);
});

app.get('/popularinwomen', async (req, res) => {
  const products = await Product.find({ category: "women" });
  res.json(products.slice(0, 4));
});

// ---------------- START SERVER ----------------
app.listen(port, () => console.log(`Server running on port ${port}`));
