const mongoose = require("mongoose");

// "created": "2020-04-14T09:27:15.898Z",
// "creator": {
//   "account": {
//     "username": "Farid",
//     "phone": "0606060606"
//   },
//   "_id": "5b4e52add1624def0707d308"
// },
// "description": "Toute neuve",
// "picture": {
//   // ...
//   // toutes les informations concernant l'image
//   // ...
//   "secure_url": "https://res.cloudinary.com/lereacteur/image/upload/v1586856434/zpmt2azvprs2oefny0wt.svg"
//   // ...
// },
// "price": 175,
// "title": "Playstation 4",
// "_id": "5b4e5cbeb8819f032ae79baf"

const Offer = mongoose.model("Offer", {
  created: Date,
  creator: {
    ref: "User",
    type: mongoose.Schema.Types.ObjectId,
  },
  description: String,
  picture: {},
  price: Number,
  title: String,
});

module.exports = Offer;
