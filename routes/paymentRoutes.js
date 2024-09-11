const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentCtrl");

// POST request to process payment
router.post("/pay", paymentController.processPayment);

module.exports = router;
