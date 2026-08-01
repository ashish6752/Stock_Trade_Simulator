const User = require("../models/User");

exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("walletBalance name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ walletBalance: user.walletBalance, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0 || amount > 100000)
      return res.status(400).json({ message: "Amount must be between $1 and $100,000" });

    const user = await User.findById(req.user.id);
    user.walletBalance = parseFloat((user.walletBalance + amount).toFixed(2));
    await user.save();

    res.json({ message: `✅ Added $${amount} to wallet`, walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
