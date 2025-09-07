require('dotenv').config();
const port=4000;
const express = require("express");
const app= express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { log } = require("console");


app.use(express.json());
app.use(cors());
app.use(mongoSanitize());
app.use(xssClean());

const Counter = mongoose.model('Counter', {
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

//Database connection with mongoDB
mongoose.connect("mongodb+srv://Kirisi:1234@cluster0.irm3ibr.mongodb.net/")

//API createion
app.get("/",(req, res)=>{
    res.send("Express App is Running")
})

// Image Storage Engine

const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

//Creating Upload Endpoints for image

app.post("/upload", fetchUser, requireAdmin, upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `https://your-domain.com/images/${req.file.filename}`
  });
});

//Schema for creating products

const Product = mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },
})

app.post('/addproduct',async(req, res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }else{
        id=1; 
    }
    const product = new Product({
        id :id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
        
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        sucess:true,
        name:req.body.name,
    })  
})

//Creating API For deleting products
app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id})
        console.log("Removed");
        res.json({
            success:true,
            name:req.body.name
    })
})

//Creating API For getting all products
app.get('/allproducts', async(req,res)=>{
    let products = await Product.find({});
    console.log("All products Fetched");
    res.send(products);
})

//Schema Creating for user model

const Users = mongoose.model('Users', {
  name: { type: String },
  email: { type: String, unique: true, index: true },
  password: { type: String },
  role: { type: String, enum: ['user','admin'], default: 'user' }, // role
  cartData: { type: Object },
  date: { type: Date, default: Date.now }
});

//Creating Endpoint for registering the user
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const exists = await Users.findOne({ email: (email||'').toLowerCase() });
  if (exists) return res.status(400).json({ success:false, errors: "Email already used" });

  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

  const hashed = await bcrypt.hash(password, 12);
  const user = new Users({
    name: username,
    email: (email||'').toLowerCase(),
    password: hashed,
    cartData: cart,
    role: 'user'
  });
  await user.save();

  const token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, { expiresIn: '15m' });
  res.json({ success:true, token });
});

// Creating endpoint for user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ email: (email||'').toLowerCase() });
  if (!user) return res.status(400).json({ success:false, errors: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ success:false, errors: "Invalid credentials" });

  const token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, { expiresIn: '15m' });
  res.json({ success:true, token });
});

//Creating endpoint for new collection data
app.get('/newcollections', async (req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collections Fetched");
    res.send(newcollection);
})

//Creating endpoint for popular in women section
app.get('/popularinwomen',async(req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})

// Creating middleware to fetch user
    const fetchUser = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).json({ errors: "No token, authorization denied" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET); // also checks expiry
    req.user = data.user; // { id: <user_id> }
    next();
  } catch (error) {
    return res.status(401).json({ errors: "Invalid or expired token" });
  }
};

//Creating endpoint for adding products in cart data
app.post('/addtocart',fetchUser,async(req,res)=>{
    console.log("Added",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] +=1;
    await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Added");
})

// Creating endpoint to remove product from cart data
app.post('/removefromcart',fetchUser,async(req,res)=>{
    console.log("removed",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -=1;
    await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Removed");
})

// Creating endpoint to get cartdata
app.post('/getcart',fetchUser,async (req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

async function getNextSequence(name) {
  const r = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return r.seq;
}

app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on Port "+port)
    }
    else {
        console.log("Error: "+error)
    }
})