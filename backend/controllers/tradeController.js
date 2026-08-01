const Stock = require("../models/Stock");
const User = require("../models/User");

// Simulated current prices (fluctuate slightly)
const STOCK_DATA = {
  AAPL:  { name: "Apple Inc.",       basePrice: 178 },
  TSLA:  { name: "Tesla Inc.",        basePrice: 245 },
  MSFT:  { name: "Microsoft Corp.",  basePrice: 415 },
  GOOGL: { name: "Alphabet Inc.",    basePrice: 172 },
  AMZN:  { name: "Amazon.com Inc.",  basePrice: 195 },
  NVDA:  { name: "NVIDIA Corp.",     basePrice: 875 },
  META:  { name: "Meta Platforms",   basePrice: 510 },
  NFLX:  { name: "Netflix Inc.",     basePrice: 620 },
  AMD:   { name: "AMD Inc.",         basePrice: 168 },
  RELIANCE: { name: "Reliance Industries", basePrice: 2890 },
  TCS:   { name: "Tata Consultancy", basePrice: 3950 },
  INFY:  { name: "Infosys Ltd.",     basePrice: 1780 },
};

const getSimulatedPrice = (symbol, basePrice) => {
  const variance = basePrice * 0.03;
  const change = (Math.random() - 0.45) * variance;
  return parseFloat((basePrice + change).toFixed(2));
};

exports.getMarketData = async (req, res) => {
  try {
    const market = Object.entries(STOCK_DATA).map(([symbol, data]) => {
      const price = getSimulatedPrice(symbol, data.basePrice);
      const change = parseFloat(((price - data.basePrice) / data.basePrice * 100).toFixed(2));
      return { symbol, name: data.name, price, change, basePrice: data.basePrice };
    });
    res.json(market);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.buyStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;

    if (!symbol || !quantity || quantity <= 0)
      return res.status(400).json({ message: "Invalid symbol or quantity" });

    const stockInfo = STOCK_DATA[symbol.toUpperCase()];
    if (!stockInfo)
      return res.status(400).json({ message: "Stock not found" });

    const currentPrice = getSimulatedPrice(symbol, stockInfo.basePrice);
    const totalCost = parseFloat((currentPrice * quantity).toFixed(2));

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.walletBalance < totalCost)
      return res.status(400).json({ message: `Insufficient balance. Need $${totalCost.toFixed(2)}, have $${user.walletBalance.toFixed(2)}` });

    // Check if stock already owned — update quantity
    let stock = await Stock.findOne({ userId, symbol: symbol.toUpperCase() });
    if (stock) {
      const totalQty = stock.quantity + quantity;
      const avgBuyPrice = parseFloat(((stock.buyPrice * stock.quantity + currentPrice * quantity) / totalQty).toFixed(2));
      stock.quantity = totalQty;
      stock.buyPrice = avgBuyPrice;
      stock.currentPrice = currentPrice;
      await stock.save();
    } else {
      stock = await Stock.create({
        userId,
        symbol: symbol.toUpperCase(),
        companyName: stockInfo.name,
        buyPrice: currentPrice,
        quantity,
        currentPrice
      });
    }

    user.walletBalance = parseFloat((user.walletBalance - totalCost).toFixed(2));
    await user.save();

    res.json({
      message: `✅ Bought ${quantity} shares of ${symbol.toUpperCase()} at $${currentPrice}`,
      stock,
      walletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;

    if (!symbol || !quantity || quantity <= 0)
      return res.status(400).json({ message: "Invalid symbol or quantity" });

    const stock = await Stock.findOne({ userId, symbol: symbol.toUpperCase() });
    if (!stock) return res.status(404).json({ message: "You don't own this stock" });
    if (stock.quantity < quantity)
      return res.status(400).json({ message: `You only have ${stock.quantity} shares` });

    const stockInfo = STOCK_DATA[symbol.toUpperCase()];
    const currentPrice = getSimulatedPrice(symbol, stockInfo?.basePrice || stock.buyPrice);
    const proceeds = parseFloat((currentPrice * quantity).toFixed(2));

    const user = await User.findById(userId);
    user.walletBalance = parseFloat((user.walletBalance + proceeds).toFixed(2));
    await user.save();

    if (stock.quantity === quantity) {
      await Stock.deleteOne({ _id: stock._id });
    } else {
      stock.quantity -= quantity;
      stock.currentPrice = currentPrice;
      await stock.save();
    }

    res.json({
      message: `✅ Sold ${quantity} shares of ${symbol.toUpperCase()} at $${currentPrice}`,
      proceeds,
      walletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const stocks = await Stock.find({ userId });

    const updated = stocks.map(stock => {
      const info = STOCK_DATA[stock.symbol];
      const currentPrice = getSimulatedPrice(stock.symbol, info?.basePrice || stock.buyPrice);
      const profit = parseFloat(((currentPrice - stock.buyPrice) * stock.quantity).toFixed(2));
      const profitPct = parseFloat(((currentPrice - stock.buyPrice) / stock.buyPrice * 100).toFixed(2));
      return {
        _id: stock._id,
        symbol: stock.symbol,
        companyName: stock.companyName || info?.name || stock.symbol,
        quantity: stock.quantity,
        buyPrice: stock.buyPrice,
        currentPrice,
        profit,
        profitPct,
        totalValue: parseFloat((currentPrice * stock.quantity).toFixed(2))
      };
    });

    const totalInvestment = updated.reduce((sum, s) => sum + s.buyPrice * s.quantity, 0);
    const currentValue = updated.reduce((sum, s) => sum + s.totalValue, 0);

    res.json({
      stocks: updated,
      totalInvestment: parseFloat(totalInvestment.toFixed(2)),
      currentValue: parseFloat(currentValue.toFixed(2)),
      profitLoss: parseFloat((currentValue - totalInvestment).toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
