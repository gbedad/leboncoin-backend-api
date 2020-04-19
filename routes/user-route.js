const express = require("express");
const router = express.Router();

const uid2 = require("uid2");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/user-model");

router.post("/user/sign_up", async (req, res) => {
  try {
    if (!req.fields.username || !req.fields.email || !req.fields.password) {
      return res.status(400).json({ message: "A value is missing" });
    }

    // Vérification que l'email n'est pas déjà utilisé par quelqu'un d'autre
    const verifyUser = await User.findOne({ email: req.fields.email });

    if (verifyUser) {
      // L'email est déjà utilisé
      return res.status(400).json({ message: "Email already used" });
    } else {
      // L'email n'est pas déjà utilisé

      // Inscrire un utilisateur

      // Générer un token
      const token = uid2(16);

      // Générer un salt
      const salt = uid2(16);

      // Générer un hash
      const hash = SHA256(req.fields.password + salt).toString(encBase64);

      const user = new User({
        email: req.fields.email,
        token: token,
        hash: hash,
        salt: salt,
        account: {
          username: req.fields.username,
          phone: req.fields.phone,
        },
      });

      await user.save();

      return res.json({
        _id: user._id,
        token: user.token,
        account: {
          username: user.account.username,
          phone: user.account.phone,
        },
      });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/user/log_in", async (req, res) => {
  try {
    console.log(req.fields); // { email: "farid@gmail.com", password: "azerty" }

    // Chercher dans la BDD l'utilisateur qui possède cette adresse email
    const user = await User.findOne({ email: req.fields.email });

    if (user) {
      // Le compte existe

      // On obtiendra le hash et le salt générés au moment de la création du compte
      // console.log(user.salt);
      // console.log(user.hash);

      // Hasher req.fields.password grâce au salt obtenu depuis la BDD et ainsi trouver un hash
      const hash = SHA256(req.fields.password + user.salt).toString(encBase64);

      // Si le hash est identique à celui obtenu dans la BDD, alors c'est le bon mot de passe
      if (hash === user.hash) {
        return res.json({
          _id: user._id,
          token: user.token,
          account: {
            username: user.account.username,
            phone: user.account.phone,
          },
        });
      } else {
        // Si le hash n'est pas identique à celui obtenu dans la BDD, alors c'est un mauvais mot de passe
        return res.status(400).json({ message: "Wrong password" });
      }
    } else {
      // Le compte n'existe pas
      return res.status(400).json({ message: "Unknown email" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
