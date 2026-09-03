import Doctor from "../models/Doctor.model.js"
import DoctorClinic from "../models/DoctorClinic.model.js"
import Clinic from "../models/Clinic.model.js"
import Appointment from "../models/Appointment.model.js"

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
    try{
        const {name, email, phone, specialization, schedule} = req.body

        if(!name || !email || !phone || !specialization){
            return res.status(400).json({
                message: "Incomplete fields"
            })
        }

        const doctorExists = await Doctor.findOne({ email })

        if(doctorExists){
            await DoctorClinic.create({
                doctorId: doctorExists._id,
                clinicId: req.clinic.id,
            })

            return res.status(200).json({
                message: "doctor added to the clinic"
            })
        }

        const doctor = await Doctor.create({
            name,
            email,
            phone,
            specialization,
            schedule
        })

        await DoctorClinic.create({
            doctorId: doctor._id,
            clinicId: req.clinic.id,
        })

        return res.status(200).json({
            message: "doctor added to the clinic"
        })

    }
    catch(error){
        console.log("Error while adding doctor in clinic.controllers.js file", error)
        return res.status(500).json({
            message: "Error while adding doctor in clinic.controllers.js file"
        })
    }
}


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