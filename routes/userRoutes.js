


const express = require('express');
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware")

//router object
const router = express.Router();

//Routes
//Login || POST
router.post("/login", loginController);

//Register || POST
router.post("/register", registerController);

//Auth || POST
router.post('/getUserData',authMiddleware,authController)



//Apply Doctor || POST
router.post('/apply-doctor',authMiddleware,applyDoctorController)


//Notification doctor || POST
router.post("/get-all-notification", authMiddleware,getAllNotificationController)

router.post("/delete-all-notification",authMiddleware,deleteAllNotificationController)


//get all Doctor
router.get('/getAllDoctors',authMiddleware,getAllDoctorsController)

//book Appointments
// router.post('/payment', )
router.post("/book-appointment",authMiddleware,bookAppointmentController);

//booking Availability
router.post("/booking-availability",authMiddleware,bookingAvailabilityController)


//Appointments list
router.get("/user-appointments",authMiddleware,userAppointmentsController)

module.exports = router;
