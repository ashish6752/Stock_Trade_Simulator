const express = require("express");
const router = express.Router();
const { buyStock, sellStock, getPortfolio, getMarketData } = require("../controllers/tradeController");
const authMiddleware = require("../middleware/auth");

router.get("/market", authMiddleware, getMarketData);
router.post("/buy", authMiddleware, buyStock);
router.post("/sell", authMiddleware, sellStock);
router.get("/portfolio", authMiddleware, getPortfolio);

module.exports = router;
