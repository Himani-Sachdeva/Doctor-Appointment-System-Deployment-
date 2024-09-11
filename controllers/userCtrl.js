const otpGenerator = require("otp-generator");
const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");
const sendEmail = require("../mail");

// Register callback
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(200)
        .send({ message: "User Already Exists", success: false });
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const newUser = new userModel(req.body);
    // otp generate
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    console.log("otp sent via email", otp);

    await sendEmail(req.body.email, otp);
    await newUser.save();
    res
      .status(201)
      .send({ message: "Registered successfully", success: true, otp });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller: ${error.message}`,
    });
  }
};

// Login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ success: false, message: "Invalid Email or Password" });
    }

    // Generate token and send response
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: `Error in Login Controller: ${error.message}` });
  }
};

// Auth callback
const authController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    if (!user) {
      return res.status(200).send({
        message: "User Not Found",
        success: false,
      });
    }

    user.password = undefined;
    res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Auth error",
      success: false,
      error,
    });
  }
};

const applyDoctorController = async (req, res) => {
  try {
    // Create a new doctor with status "pending"
    const newDoctor = new doctorModel({ ...req.body, status: "pending" });
    console.log(newDoctor);

    // Save the new doctor
    await newDoctor.save();
    console.log("Doctor details saved successfully:", newDoctor);

    // Find the admin user
    const adminUser = await userModel.findOne({ isAdmin: true });

    // Check if adminUser exists
    if (!adminUser) {
      console.error("Admin user not found");
      return res.status(404).send({
        success: false,
        message: "Admin user not found",
      });
    }

    console.log("Admin user found:", adminUser);

    // Initialize the notification array if it doesn't exist
    const notification = adminUser.notification || [];

    // Push the new notification
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: `${newDoctor.firstName} ${newDoctor.lastName}`,
        onClickPath: "/admin/doctors",
      },
    });

    // Update the admin user's notifications
    await userModel.findByIdAndUpdate(adminUser._id, { notification });
    console.log("Admin user's notifications updated successfully");

    // Send a success response
    return res.status(201).send({
      success: true,
      message: "Doctor Account Applied Successfully",
    });
  } catch (error) {
    // Log the error with more detail
    console.error("Error in applyDoctorController:", error);

    // Send a detailed error response
    return res.status(500).send({
      success: false,
      error: error.message,
      message: "Error while applying for doctor",
    });
  }
};

//notification Ctrl
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;
    seennotification.push(...notification);
    user.notification = [];
    user.seennotification = notification;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "All notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in Notification",
      success: false,
      error,
    });
  }
};

//delete Notification
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted Successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Unable to delete all notification",
      error,
    });
  }
};

//get all Doctor
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctor List Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.send(500).send({
      success: false,
      error,
      message: "Error while fetching doctors",
    });
  }
};
//BOOK APPOINTMENT


const bookAppointmentController = async (req, res) => {
  try {
    const { userId, doctorId, date, time } = req.body;

    if (!userId || !doctorId || !date || !time) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Fetch user info
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Fetch doctor info
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found." });
    }


    const appointmentDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");
    const appointmentTime = moment(time, "HH:mm").format("HH:mm");

    const start = moment(doctor.timings[0], "HH:mm");
    const end = moment(doctor.timings[1], "HH:mm");
    const requestedTime = moment(appointmentTime, "HH:mm");
    console.log(requestedTime)

    if (requestedTime.isBefore(start) || requestedTime.isAfter(end)) {
      return res.status(400).send({
        success: false,
        message: "Selected time is outside of available hours",
      });
    }

    // Check if the slot is already booked
    const existingAppointment = await appointmentModel.findOne({
      doctorId,
      date: appointmentDate,
      time: appointmentTime,
    });
    if (existingAppointment) {
      return res.status(400).send({
        success: false,
        message: "Slot already booked",
      });
    }

    // Create appointment
    const appointment = new appointmentModel({
      userId,
      doctorId,
      userInfo: `${user.name}, ${user.phoneNumber}, ${user.email}`, // Format user info
      doctorInfo: `${doctor.firstName} ${doctor.lastName}, ${doctor.phone}, ${doctor.email}`, // Format doctor info
      date: appointmentDate,
      time: appointmentTime,
    });

    await appointment.save(); 

    res.status(201).send({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).send({
      success: false,
      message: "Error booking appointment",
      error: error.message,
    });
  }
};

// booking AvailabilityController
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not Available at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};

const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};

module.exports = {
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
};
