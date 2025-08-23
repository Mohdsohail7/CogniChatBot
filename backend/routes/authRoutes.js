const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// route for registeration
router.post("/register", authController.register);

// route for login
router.post("/login", authController.login);

// route for google 
router.post("/google-login", authController.googleAuth);

// route for getting current user
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;