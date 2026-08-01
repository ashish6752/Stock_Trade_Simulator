const express = require("express");
const router = express.Router();
const { getWallet, addFunds } = require("../controllers/walletController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getWallet);
router.post("/add", authMiddleware, addFunds);

module.exports = router;
