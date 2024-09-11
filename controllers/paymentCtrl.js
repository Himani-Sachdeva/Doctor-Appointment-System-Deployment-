exports.processPayment = (req, res) => {
  const { name, cardNumber, amount } = req.body;

  // Simple validation
  if (!name || !cardNumber || !amount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (cardNumber.length !== 12 || isNaN(cardNumber)) {
    return res.status(400).json({ message: "Card number must be 12 digits" });
  }

  // Mock payment processing
  res.status(200).json({ message: "Payment Successful" });
};
