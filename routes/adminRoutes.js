const express = require("express");
// import Doctors from './../client/src/pages/admin/Doctors';
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
  deleteUsers,
  rejectDoctor,
} = require("../controllers/adminCtrl");

const router = express.Router();

//get method || Users
router.get("/getAllUsers", authMiddleware, getAllUsersController);

//get method || Doctors
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

// post || account status
router.post(
  "/changeAccountStatus",
  authMiddleware,
  changeAccountStatusController
);
router.delete("/deleteUsers/:userId", authMiddleware, deleteUsers);
router.post("/rejectDoctor", authMiddleware, rejectDoctor);

module.exports = router;
