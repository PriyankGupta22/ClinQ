import Appointment from "../models/Appointment.model.js";
import Clinic from "../models/Clinic.model.js";
import Doctor from "../models/Doctor.model.js";
import DoctorClinic from "../models/DoctorClinic.model.js";

export const createAppointment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const { clinicId, doctorId, reason, age, appointmentDate, isEmergency } = req.body;

        if (!clinicId || !doctorId || !reason?.trim()) {
            return res.status(400).json({
                message: "Clinic, doctor and reason are required"
            });
        }

        if (age !== undefined && (!Number.isInteger(Number(age)) || Number(age) < 0 || Number(age) > 130)) {
            return res.status(400).json({ message: "A valid age is required" });
        }

        const clinic = await Clinic.findById(clinicId);

        if (!clinic) {
            return res.status(404).json({
                message: "Clinic not found"
            });
        }

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        const clinicDoctor = await DoctorClinic.findOne({
            clinicId,
            doctorId
        });

        if (!clinicDoctor) {
            return res.status(400).json({
                message: "Doctor does not belong to this clinic"
            });
        }

        const requestedDate = appointmentDate ? new Date(appointmentDate) : new Date();

        if (Number.isNaN(requestedDate.getTime())) {
            return res.status(400).json({ message: "Valid appointment date is required" });
        }
        if (requestedDate <= new Date()) {
            return res.status(400).json({ message: "Appointment date must be in the future" });
        }

        const existingAppointment = await Appointment.findOne({
            userId,
            doctorId,
            clinicId,
            appointmentDate: requestedDate,
            status: "scheduled"
        });

        if (existingAppointment) {
            return res.status(400).json({
                message: "You already have an appointment"
            });
        }

        const appointment = await Appointment.create({
            userId,
            doctorId,
            clinicId,
            appointmentDate: requestedDate,
            duration: clinic.appointmentDuration,
            reason: reason.trim(),
            ...(age !== undefined ? { age: Number(age) } : {}),
            isEmergency: isEmergency === true || req.body.priority === "emergency"
        });

        req.appointment = appointment
        next()

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id;

        const appointments = await Appointment.find({
            userId
        })
            .populate("doctorId")
            .populate("clinicId")
            .sort({ appointmentDate: 1 });

        return res.status(200).json({
            message: "Appointments fetched successfully",
            appointments
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId, clinicId } = req.body;

        const appointments = await Appointment.find({
            doctorId,
            clinicId
        });

        return res.status(200).json({
            appointments
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;

        if (!appointmentId || !status) {
            return res.status(400).json({
                message: "Appointment ID and status are required"
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        return res.status(200).json({
            message: "Appointment status updated successfully",
            appointment
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};