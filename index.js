// Va nous permettre d'avoir accès à process.env
require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const cors = require("cors");

const formidable = require("express-formidable");

app.use(formidable());

// Permet d'autoriser tous les sites à appeler votre API
app.use(cors());

// Séparer les routes et les models
// Créer le model Offer
// Créer la route /offer/publish

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Importer Cloudinary
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dxwqcwkfy",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userRoutes = require("./routes/user-route");
app.use(userRoutes);

const offerRoutes = require("./routes/offer-route");
app.use(offerRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server started on port : " + process.env.PORT);
});