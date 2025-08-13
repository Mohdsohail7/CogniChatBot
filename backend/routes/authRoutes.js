const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// route for registeration
router.post("/register", authController.register);

// route for login
router.post("/login", authController.login);

// route for google 
router.post("/google-login", authController.googleAuth);

module.exports = router;