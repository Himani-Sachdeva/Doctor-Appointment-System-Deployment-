const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

// Fetch doctor info by userId
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Doctor data fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error fetching doctor info:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching doctor details",
      error: error.message,
    });
  }
};

// Update doctor profile
const updateProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body,
      { new: true } // Return the updated document
    );

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).send({
      success: false,
      message: "Error updating doctor profile",
      error: error.message,
    });
  }
};

// Get single doctor by _id
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.body.doctorId);

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error fetching doctor info by ID:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching doctor info",
      error: error.message,
    });
  }
};
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
      userInfo: `${user.name}, ${user.phoneNumber}, ${user.email}`,
      doctorInfo: `${doctor.firstName} ${doctor.lastName}, ${doctor.phone}, ${doctor.email}`,
      date: appointmentDate,
      time: appointmentTime,
    });

    await appointment.save();

    res.status(201).send({
      success: true,
      message: "Appointment booked successfully",
      data: appointment, // Send back the created appointment
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

const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointments = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status }
    );
    const user = await userModel.findOne({ _id: appointments.userId });
    const notification = user.notification;
    notification.push({
      type: "status-updated",
      message: `Your appointment has been updated ${status}`,
      onCLickPath: "/doctor-appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Status Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Update Status",
    });
  }
};

const getDoctorAppointment = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });
    }

    // Find the doctor by user ID
    const doctor = await doctorModel.findOne({ userId });

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found." });
    }

    // Find appointments by doctor ID
    const appointments = await appointmentModel
      .find({ doctorId: doctor._id })
      .populate("userId")
      .populate("doctorId");

    if (!appointments) {
      return res.status(404).json({
        success: false,
        message: "No appointments found for this doctor.",
      });
    }

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error fetching doctor's appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctor's appointments",
      error: error.message,
    });
  }
};
module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  bookAppointmentController,
  updateStatusController,
  getDoctorAppointment,
};
