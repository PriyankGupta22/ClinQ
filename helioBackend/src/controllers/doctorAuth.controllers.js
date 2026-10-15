import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.model.js";
import DoctorClinic from "../models/DoctorClinic.model.js";

const issueTokens = (doctor) => ({
  accessToken: jwt.sign({ id: doctor._id, role: "doctor" }, process.env.JWT_SECRET, { expiresIn: "15m" }),
  refreshToken: jwt.sign({ id: doctor._id, role: "doctor" }, process.env.REFRESH_JWT_SECRET, { expiresIn: "7d" }),
});

export const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      // New doctors set their clinic-specific availability after a clinic links them.
      // These defaults keep registration valid with the current onboarding form.
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingDoctor = await Doctor.findOne({
      email: email.toLowerCase(),
    });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "Doctor already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      specialization,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      ...issueTokens(doctor),
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error("Doctor registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register doctor",
      error: error.message,
    });
  }
};

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // The password is intentionally excluded by the schema by default, so it
    // must be selected explicitly for credential verification at login.
    const doctor = await Doctor.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!doctor.isActive) {
      return res.status(403).json({
        success: false,
        message: "Doctor account is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      doctor.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor login successful",
      ...issueTokens(doctor),
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error("Doctor login error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login doctor",
      error: error.message,
    });
  }
};

export const getDoctorMe = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor.id).select(
      "-password"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get doctor",
      error: error.message,
    });
  }
};

export const getDoctorClinics = async (req, res) => {
  try {
    const clinics = await DoctorClinic.find({ doctorId: req.doctor.id })
      .populate({
        path: "clinicId",
        match: { isActive: true },
        select: "clinicName email phone address description isActive",
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      clinics: clinics.filter((link) => link.clinicId),
    });
  } catch (error) {
    console.error("Get doctor clinics error:", error);
    return res.status(500).json({ success: false, message: "Failed to load doctor clinics" });
  }
};

export const refreshDoctorAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: "Refresh token is required" });
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    if (decoded.role !== "doctor") return res.status(403).json({ success: false, message: "Doctor access required" });
    const doctor = await Doctor.findById(decoded.id);
    if (!doctor?.isActive) return res.status(403).json({ success: false, message: "Doctor account is inactive" });
    return res.json({ success: true, ...issueTokens(doctor) });
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};
