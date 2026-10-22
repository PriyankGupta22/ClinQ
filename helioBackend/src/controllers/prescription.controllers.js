import Prescription from "../models/Prescriptions.model.js";
import Appointment from "../models/Appointment.model.js";
import DoctorClinic from "../models/DoctorClinic.model.js";
import QueueEntry from "../models/QueueEntity.model.js";
import Queue from "../models/Queue.model.js";
import updateQueue, { startNextWaitingPatient } from "../utils/queue.utils.js";

const getDoctorClinicId = async (req, res) => {
  const { clinicId } = req.query;
  if (!clinicId) return null;

  const link = await DoctorClinic.exists({ doctorId: req.user.id, clinicId });
  if (!link) {
    res.status(403).json({
      success: false,
      message: "You are not assigned to this clinic",
    });
    return false;
  }
  return clinicId;
};


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
      feverChart,
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

    // Never trust identifiers submitted by the browser.  The appointment is
    // the authoritative link between doctor, patient and clinic.
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: req.user.id,
      userId,
      clinicId,
    });

    if (!appointment) {
      return res.status(403).json({
        success: false,
        message: "The selected appointment does not belong to this doctor, patient and clinic",
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
      feverChart,
      storeStatus: "pending",
      sentToStoreAt: new Date(),
    });

    const activeEntry = await QueueEntry.findOneAndUpdate(
      { appointmentId, doctorId: req.user.id, clinicId, status: "consulting" },
      { $set: { status: "completed", consultationEndedAt: new Date() } },
      { new: true }
    );
    if (activeEntry) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: "completed" });
      await startNextWaitingPatient(doctorId, clinicId, activeEntry.date);
      await updateQueue(doctorId, clinicId, activeEntry.date);
      const io = req.app.get("io");
      if (io) {
        const dayStart = new Date(activeEntry.date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const queue = await Queue.findOne({ doctorId, clinicId, date: { $gte: dayStart, $lt: dayEnd } })
          .populate({ path: "entries", options: { sort: { queueNumber: 1 } }, populate: [
            { path: "userId", select: "name email" },
            { path: "doctorId", select: "name specialization schedule" },
            { path: "appointmentId", select: "appointmentDate reason" },
          ] });
        const roomDate = [dayStart.getFullYear(), String(dayStart.getMonth() + 1).padStart(2, "0"), String(dayStart.getDate()).padStart(2, "0")].join("-");
        io.to(`queue:${clinicId}:${doctorId}:${roomDate}`).emit("queueUpdated", { message: "Prescription submitted and consultation completed", queue });
      }
    }

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
// GET APPOINTMENTS AVAILABLE FOR THE LOGGED-IN DOCTOR
// ======================================================
export const getMyDoctorAppointments = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Only doctors can access appointments" });
    }

    const clinicId = await getDoctorClinicId(req, res);
    if (clinicId === false) return;
    const appointmentQuery = {
      doctorId: req.user.id,
      status: { $ne: "cancelled" },
      ...(clinicId ? { clinicId } : {}),
    };
    const issuedAppointments = await Prescription.find({
      doctorId: req.user.id,
      ...(clinicId ? { clinicId } : {}),
    }).distinct("appointmentId");
    const appointments = await Appointment.find({
      ...appointmentQuery,
      _id: { $nin: issuedAppointments },
    })
      .populate("userId", "name email")
      .populate("clinicId", "clinicName address")
      .sort({ appointmentDate: -1 });

    return res.json({ success: true, appointments });
  } catch (error) {
    console.error("Get doctor prescription appointments error:", error);
    return res.status(500).json({ success: false, message: "Failed to load appointments" });
  }
};

// ======================================================
// STORE / PHARMACY QUEUE FOR A CLINIC
// ======================================================
export const getClinicStorePrescriptions = async (req, res) => {
  try {
    if (req.user.role !== "clinicAdmin") {
      return res.status(403).json({ success: false, message: "Clinic store access required" });
    }

    const prescriptions = await Prescription.find({ clinicId: req.user.id })
      .populate("doctorId", "name specialization")
      .populate("userId", "name email")
      .populate("appointmentId", "appointmentDate")
      .sort({ sentToStoreAt: -1 });

    return res.json({ success: true, count: prescriptions.length, prescriptions });
  } catch (error) {
    console.error("Get clinic store prescriptions error:", error);
    return res.status(500).json({ success: false, message: "Failed to load store prescriptions" });
  }
};

export const updateClinicStorePrescriptionStatus = async (req, res) => {
  try {
    if (req.user.role !== "clinicAdmin") {
      return res.status(403).json({ success: false, message: "Clinic store access required" });
    }

    const { status } = req.body;
    if (!["pending", "dispensed", "unavailable"].includes(status)) {
      return res.status(400).json({ success: false, message: "A valid store status is required" });
    }

    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.prescriptionId, clinicId: req.user.id },
      { storeStatus: status },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found for this clinic" });
    }

    await prescription.populate("doctorId", "name specialization");
    await prescription.populate("userId", "name email");

    return res.json({ success: true, message: "Store status updated", prescription });
  } catch (error) {
    console.error("Update clinic store prescription status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update store status" });
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

    const clinicId = await getDoctorClinicId(req, res);
    if (clinicId === false) return;
    const prescriptions = await Prescription.find({
      doctorId: req.user.id,
      ...(clinicId ? { clinicId } : {}),
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

    const isDoctor = req.user.role === "doctor" && prescription.doctorId.toString() === req.user.id;
    const isPatient = ["user", "patient"].includes(req.user.role) && prescription.userId.toString() === req.user.id;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this prescription",
      });
    }

    if (isPatient && Object.keys(req.body).some((field) => field !== "feverChart")) {
      return res.status(403).json({
        success: false,
        message: "Patients can only update the fever chart",
      });
    }

    if (req.body.feverChart !== undefined) {
      if (!req.body.feverChart || typeof req.body.feverChart !== "object" || Array.isArray(req.body.feverChart)) {
        return res.status(400).json({ success: false, message: "A valid fever chart is required" });
      }
      prescription.feverChart = req.body.feverChart;
    }

    if (isPatient) {
      await prescription.save();
      return res.status(200).json({ success: true, message: "Fever chart updated successfully", prescription });
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
