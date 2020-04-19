const express = require("express");
const router = express.Router();

const cloudinary = require("cloudinary");

const Offer = require("../models/offer-model");
const User = require("../models/user-model");

const isAuthenticated = require("../middlewares/is-authenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  // console.log(req.fields); // title, price, description, etc.
  // Récupérer le fichier envoyé par le client
  // console.log(req.files.picture.path); // une image

  // console.log(req.headers.authorization); // "Bearer EGUA1iF4EF2dw55M"

  const user = req.user;

  try {
    if (user) {
      // un utilisateur a été trouvé

      // Envoyer le fichier vers Cloudinary
      const result = await cloudinary.uploader.upload(req.files.picture.path, {
        public_id: "Home/LeReacteur/leboncoin/mypictures",
      });

      // Récupérer l'url de Cloudinary
      // console.log(result);

      // Sauvegarder dans la base de données l'annonce ainsi que l'url de l'image
      const offer = new Offer({
        created: Date.now(), // 1587026051028
        creator: user,
        description: req.fields.description,
        picture: result,
        price: req.fields.price,
        title: req.fields.title,
      });

      await offer.save();

      // Répondre au client
      return res.json({
        created: offer.created,
        creator: {
          account: {
            username: user.account.username,
            phone: user.account.phone,
          },
          _id: user._id,
        },
        description: offer.description,
        picture: offer.picture,
        price: offer.price,
        title: offer.title,
        _id: offer._id,
      });

      // return res.json({
      //   ...offer,
      //   creator: {
      //     account: {
      //       username: user.account.username,
      //       phone: user.account.phone,
      //     },
      //     _id: user._id,
      //   },
      // });
    } else {
      // aucun utilisateur n'a été trouvé
      return res.status(401).json({
        error: "Unauthorized"
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
});

router.get("/offer/with-count", async (req, res) => {
  try {
    const filters = {};

    if (req.query.title) {
      filters.title = new RegExp(req.query.title, "i");
    }

    // OK cas avec que priceMin
    // OK cas avec que priceMax
    // OK cas avec priceMin et priceMax

    if (req.query.priceMin) {
      filters.price = {
        $gte: req.query.priceMin,
      };
    }

    if (req.query.priceMax) {
      // filters.price = {
      //   $lte: req.query.priceMax,
      // };
      if (!filters.price) {
        filters.price = {};
      }

      filters.price.$lte = req.query.priceMax;
    }

    // if (req.query.priceMin && req.query.priceMax) {
    //   filters.price = {
    //     $gte: req.query.priceMin,
    //     $lte: req.query.priceMax,
    //   };
    // }

    let sort = {};

    if (req.query.sort === "date-desc") {
      sort = {
        date: "desc"
      };
    } else if (req.query.sort === "date-asc") {
      sort = {
        date: "asc"
      };
    } else if (req.query.sort === "price-asc") {
      sort = {
        price: "asc"
      };
    } else if (req.query.sort === "price-desc") {
      sort = {
        price: "desc"
      };
    }

    // Compter le nombre de résultat
    const count = await Offer.countDocuments(filters);

    let offers;

    // Récupérer des annonces

    let page = Number(req.query.page);
    if (!page) {
      // Forcer à afficher la première page
      page = 1;
    }

    let limit = 2;

    // On affiche 2 resultats par page
    // Si on me demande page 1, alors le skip est 0 et limit est 2
    // Si on me demande page 2, alors le skip est 2 et limit est 2
    // Si on me demande page 3, alors le skip est 4 et limit est 2
    console.log(filters);

    offers = await Offer.find(filters)
      .select("title price created creator picture.secure_url description")
      .populate({
        path: "creator",
        select: "account.username account.phone",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort);

    // Répondre au client
    return res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
});

router.get("/offer/:id", async (req, res) => {
  console.log(req.params.id); // 5e981aba7cb1e01fef4d2e63

  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "creator",
      select: "account.username account.phone",
    });
    if (offer) {
      // l'offre existe
      return res.json(offer);
    } else {
      // l'offre existe pas
      return res.status(404).json({
        message: "Offer not foud"
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: error.message
    });
  }
});

module.exports = router;