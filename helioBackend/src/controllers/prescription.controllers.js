import Prescription from "../models/Prescriptions.model.js";


// ======================================================
// CREATE PRESCRIPTION
// ======================================================

export const createPrescription = async (req, res) => {
  try {
    const {
      appointmentId,
      doctorId,
      userId,
      clinicId,
      diagnosis,
      symptoms,
      medicines,
      tests,
      advice,
      followUpDate,
      notes,
    } = req.body;

    // Only doctor can create prescription
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can create prescriptions",
      });
    }

    // Basic validation
    if (!appointmentId || !doctorId || !userId || !clinicId) {
      return res.status(400).json({
        success: false,
        message:
          "appointmentId, doctorId, userId and clinicId are required",
      });
    }

    // Make sure logged-in doctor is creating his own prescription
    if (req.user.id !== doctorId) {
      return res.status(403).json({
        success: false,
        message: "You can only create prescriptions for yourself",
      });
    }

    // Check if prescription already exists for appointment
    const existingPrescription = await Prescription.findOne({
      appointmentId,
    });

    if (existingPrescription) {
      return res.status(409).json({
        success: false,
        message: "Prescription already exists for this appointment",
      });
    }

    const prescription = await Prescription.create({
      appointmentId,
      doctorId,
      userId,
      clinicId,
      diagnosis,
      symptoms,
      medicines,
      tests,
      advice,
      followUpDate,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    console.error("Create prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message,
    });
  }
};


// ======================================================
// GET PRESCRIPTION BY ID
// ======================================================

export const getPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findById(
      prescriptionId
    )
      .populate("doctorId", "name specialization")
      .populate("userId", "name email")
      .populate("clinicId", "clinicName address")
      .populate("appointmentId");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Doctor can see his prescription
    // Patient can see his prescription
    const isDoctor =
      req.user.role === "doctor" &&
      prescription.doctorId._id.toString() === req.user.id;

    const isPatient =
      ["user", "patient"].includes(req.user.role) &&
      prescription.userId._id.toString() === req.user.id;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this prescription",
      });
    }

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("Get prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get prescription",
      error: error.message,
    });
  }
};


// ======================================================
// GET PATIENT PRESCRIPTIONS
// ======================================================

export const getPatientPrescriptions = async (req, res) => {
  try {
    // Only patient can access this route
    if (!["user", "patient"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only patients can access their prescriptions",
      });
    }

    const prescriptions = await Prescription.find({
      userId: req.user.id,
    })
      .populate("doctorId", "name specialization")
      .populate("clinicId", "clinicName address")
      .populate("appointmentId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get patient prescriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get patient prescriptions",
      error: error.message,
    });
  }
};


// ======================================================
// GET DOCTOR PRESCRIPTIONS
// ======================================================

export const getDoctorPrescriptions = async (req, res) => {
  try {
    // Only doctor can access this route
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can access this data",
      });
    }

    const prescriptions = await Prescription.find({
      doctorId: req.user.id,
    })
      .populate("userId", "name email")
      .populate("clinicId", "clinicName address")
      .populate("appointmentId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get doctor prescriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get doctor prescriptions",
      error: error.message,
    });
  }
};


// ======================================================
// UPDATE PRESCRIPTION
// ======================================================

export const updatePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findById(
      prescriptionId
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Only doctor can update
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can update prescriptions",
      });
    }

    // Doctor can update only his own prescription
    if (prescription.doctorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own prescriptions",
      });
    }

    const {
      diagnosis,
      symptoms,
      medicines,
      tests,
      advice,
      followUpDate,
      notes,
    } = req.body;

    // Update only provided fields
    if (diagnosis !== undefined) {
      prescription.diagnosis = diagnosis;
    }

    if (symptoms !== undefined) {
      prescription.symptoms = symptoms;
    }

    if (medicines !== undefined) {
      prescription.medicines = medicines;
    }

    if (tests !== undefined) {
      prescription.tests = tests;
    }

    if (advice !== undefined) {
      prescription.advice = advice;
    }

    if (followUpDate !== undefined) {
      prescription.followUpDate = followUpDate;
    }

    if (notes !== undefined) {
      prescription.notes = notes;
    }

    await prescription.save();

    return res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      prescription,
    });
  } catch (error) {
    console.error("Update prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update prescription",
      error: error.message,
    });
  }
};


// ======================================================
// DELETE PRESCRIPTION
// ======================================================

export const deletePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findById(
      prescriptionId
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Only doctor can delete
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can delete prescriptions",
      });
    }

    // Doctor can delete only his own prescription
    if (prescription.doctorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own prescriptions",
      });
    }

    await Prescription.findByIdAndDelete(prescriptionId);

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("Delete prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete prescription",
      error: error.message,
    });
  }
};
