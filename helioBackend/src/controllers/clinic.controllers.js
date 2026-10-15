import Doctor from "../models/Doctor.model.js"
import DoctorClinic from "../models/DoctorClinic.model.js"
import Clinic from "../models/Clinic.model.js"
import Appointment from "../models/Appointment.model.js"
import Queue from "../models/Queue.model.js"

export const searchClinics = async (req, res) => {
    try {
        const { search, specialty, distance, rating } = req.query;

        // Build clinic query
        const clinicQuery = { isActive: true };
        if (search) {
            const searchRegex = new RegExp(search, "i");
            clinicQuery.$or = [
                { clinicName: searchRegex },
                { "address.city": searchRegex },
                { description: searchRegex }
            ];
        }

        const clinics = await Clinic.find(clinicQuery).lean();

        // Process each clinic to get doctors and specialists
        const results = await Promise.all(clinics.map(async (clinic) => {
            const doctorLinks = await DoctorClinic.find({ clinicId: clinic._id })
                .populate({ path: "doctorId", match: { isActive: true } });
            
            const doctors = doctorLinks
                .map(link => link.doctorId)
                .filter(doc => doc !== null);

            // Extract unique specialties from doctors
            const specialists = [...new Set(doctors.map(doc => doc.specialization).filter(Boolean))];

            // If a specialty filter is applied, only return the clinic if it has that specialty
            // (or if the clinic itself matched the search)
            if (specialty) {
                const specialtyRegex = new RegExp(specialty, "i");
                const hasSpecialty = specialists.some(spec => specialtyRegex.test(spec));
                if (!hasSpecialty) return null;
            }

            // Calculate live queue stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const queues = await Queue.find({
                clinicId: clinic._id,
                date: { $gte: today, $lt: tomorrow }
            });
            
            let totalPatients = 0;
            queues.forEach(q => {
                if (q.entries) totalPatients += q.entries.length;
            });
            
            const liveQueue = {
                patients: totalPatients,
                waitTime: totalPatients * 3
            };

            return {
                ...clinic,
                doctors: doctors,
                doctorCount: doctors.length,
                specialists: specialists,
                liveQueue: liveQueue,
                // Mock fields since they are not in the schema, 
                // but frontend allows filtering and displays them
                rating: 4.5 + Math.random() * 0.5, 
                distance: Math.floor(Math.random() * 15) + 1 
            };
        }));

        // Filter out nulls from the specialty filter
        let finalClinics = results.filter(c => c !== null);

        // Apply rating/distance filters if provided
        if (rating) {
            finalClinics = finalClinics.filter(c => c.rating >= parseFloat(rating));
        }
        if (distance) {
            finalClinics = finalClinics.filter(c => c.distance <= parseFloat(distance));
        }

        return res.status(200).json({
            message: "Clinics searched successfully",
            clinics: finalClinics
        });
    } catch (error) {
        console.log("Error in searchClinics", error);
        return res.status(500).json({ message: "Error in searchClinics" });
    }
};


export const getPublicClinics = async (req, res) => {
    try {
        const clinics = await Clinic.find({ isActive: true })
            .select("clinicName email phone address description isActive")
            .sort({ clinicName: 1 });

        return res.status(200).json({
            message: "Clinics fetched successfully",
            clinics
        });
    } catch (error) {
        console.log("Error while getting public clinics", error);
        return res.status(500).json({ message: "Error while getting public clinics" });
    }
};

export const getPublicClinicDoctors = async (req, res) => {
    try {
        const clinic = await Clinic.findOne({ _id: req.params.clinicId, isActive: true })
            .select("clinicName email phone address description isActive");

        if (!clinic) return res.status(404).json({ message: "Clinic not found" });

        const doctors = await DoctorClinic.find({ clinicId: clinic._id })
            .populate({ path: "doctorId", match: { isActive: true }, select: "name email phone specialization schedule isActive" });

        return res.status(200).json({
            message: "Clinic doctors fetched successfully",
            clinic,
            doctors: doctors.filter((item) => item.doctorId)
        });
    } catch (error) {
        console.log("Error while getting public clinic doctors", error);
        return res.status(500).json({ message: "Error while getting public clinic doctors" });
    }
};

export const addDoctorController = async (req, res) => {
    try {
        const { doctorId } = req.body;
        if (!doctorId) return res.status(400).json({ message: "A registered doctor is required" });

        const doctor = await Doctor.findOne({ _id: doctorId, isActive: true })
            .select("name email phone specialization isActive");
        if (!doctor) return res.status(404).json({ message: "Registered doctor not found" });

        const existingLink = await DoctorClinic.findOne({ doctorId: doctor._id, clinicId: req.clinic.id });
        if (existingLink) return res.status(409).json({ message: "This doctor is already part of your clinic" });

        const link = await DoctorClinic.create({ doctorId: doctor._id, clinicId: req.clinic.id });
        return res.status(201).json({
            message: "Doctor added to the clinic",
            doctor: { ...link.toObject(), doctorId: doctor }
        });
    } catch (error) {
        console.log("Error while adding doctor", error);
        return res.status(500).json({ message: "Unable to add doctor to clinic" });
    }
};

export const searchRegisteredDoctors = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const query = { isActive: true };
        if (search) {
            const expression = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            query.$or = [{ name: expression }, { email: expression }, { specialization: expression }, { phone: expression }];
        }

        const doctors = await Doctor.find(query)
            .select("name email phone specialization isActive")
            .sort({ name: 1 })
            .limit(20)
            .lean();
        const currentLinks = await DoctorClinic.find({ clinicId: req.clinic.id }).select("doctorId").lean();
        const linkedDoctorIds = new Set(currentLinks.map((link) => String(link.doctorId)));

        return res.json({ doctors: doctors.map((doctor) => ({ ...doctor, isLinked: linkedDoctorIds.has(String(doctor._id)) })) });
    } catch (error) {
        console.log("Error while searching doctors", error);
        return res.status(500).json({ message: "Unable to search registered doctors" });
    }
};


export const getClinicDoctors = async (req, res) => {
    try {
        const doctors = await DoctorClinic.find({
            clinicId: req.clinic.id
        }).populate("doctorId");

        return res.status(200).json({
            message: "Clinic doctors fetched successfully",
            doctors
        });
    }
    catch (error) {
        console.log(
            "Error while getting clinic doctors",
            error
        );

        return res.status(500).json({
            message: "Error while getting clinic doctors"
        });
    }
};


export const removeDoctorFromClinic = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const doctorClinic = await DoctorClinic.findOneAndDelete({
            doctorId: doctorId,
            clinicId: req.clinic.id
        });

        if (!doctorClinic) {
            return res.status(404).json({
                message: "Doctor is not associated with this clinic"
            });
        }

        return res.status(200).json({
            message: "Doctor removed from clinic successfully"
        });
    }
    catch (error) {
        console.log(
            "Error while removing doctor from clinic",
            error
        );

        return res.status(500).json({
            message: "Error while removing doctor from clinic"
        });
    }
};


export const updateDoctorSchedule = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { schedule } = req.body;

        if (!schedule || !Array.isArray(schedule)) {
            return res.status(400).json({
                message: "Valid schedule is required"
            });
        }

        const doctorClinic = await DoctorClinic.findOneAndUpdate(
            {
                doctorId: doctorId,
                clinicId: req.clinic.id
            },
            {
                $set: {
                    schedule: schedule
                }
            },
            {
                new: true
            }
        );

        if (!doctorClinic) {
            return res.status(404).json({
                message: "Doctor is not associated with this clinic"
            });
        }

        return res.status(200).json({
            message: "Doctor schedule updated successfully",
            schedule: doctorClinic.schedule
        });
    }
    catch (error) {
        console.log(
            "Error while updating doctor schedule",
            error
        );

        return res.status(500).json({
            message: "Error while updating doctor schedule"
        });
    }
};

export const getClinicAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ clinicId: req.clinic.id })
            .populate("doctorId", "name specialization")
            .populate("userId", "name email")
            .sort({ appointmentDate: 1 });

        return res.status(200).json({
            message: "Clinic appointments fetched successfully",
            appointments
        });
    } catch (error) {
        console.log("Error while getting clinic appointments", error);
        return res.status(500).json({ message: "Error while getting clinic appointments" });
    }
};

export const getClinicDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const clinicId = req.clinic.id;
        const todayAppointments = await Appointment.find({
            clinicId,
            appointmentDate: { $gte: today, $lt: tomorrow }
        }).select("userId appointmentDate status");

        const doctorLinks = await DoctorClinic.find({ clinicId })
            .populate({ path: "doctorId", match: { isActive: true }, select: "_id" });

        const activeDoctors = doctorLinks.filter((link) => link.doctorId).length;
        const patientsToday = new Set(todayAppointments.map((appointment) => String(appointment.userId))).size;
        const trend = [];

        for (let offset = 6; offset >= 0; offset -= 1) {
            const start = new Date(today);
            start.setDate(start.getDate() - offset);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            const dayAppointments = await Appointment.find({
                clinicId,
                appointmentDate: { $gte: start, $lt: end }
            }).select("userId");
            trend.push({
                label: start.toLocaleDateString("en-US", { weekday: "short" }),
                patients: new Set(dayAppointments.map((appointment) => String(appointment.userId))).size,
                appointments: dayAppointments.length,
                doctors: activeDoctors
            });
        }

        return res.status(200).json({
            message: "Clinic dashboard stats fetched successfully",
            stats: {
                patientsToday,
                appointmentsToday: todayAppointments.length,
                activeDoctors,
                trend
            }
        });
    } catch (error) {
        console.log("Error while getting clinic dashboard stats", error);
        return res.status(500).json({ message: "Error while getting clinic dashboard stats" });
    }
};
