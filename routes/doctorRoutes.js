const express = require("express")
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,bookAppointmentController,
    updateStatusController,
    getDoctorAppointment
} = require("../controllers/doctorCtrl");
const router = express.Router();

// POST Single doctor info
router.post("/getDoctorInfo",authMiddleware,getDoctorInfoController);

//POST update Profile
router.post("/updateProfile",authMiddleware,updateProfileController);

//post get single doc info
router.post("/getDoctorById",authMiddleware,getDoctorByIdController)


router.get("/doctor-appointments",authMiddleware,bookAppointmentController)

router.get("/getdoctor-appointments", authMiddleware,getDoctorAppointment);



//post update status
router.post("/update-status",authMiddleware,updateStatusController);

module.exports = router